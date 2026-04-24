import { headers } from 'next/headers';
import { z } from 'zod';
import {
  assertAuthAttemptAllowed,
  buildSessionKey,
  observeSession,
  recordAuthEvent,
} from '@/lib/auth-security';
import { createAdminClient } from '@/lib/supabase/admin';

export const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

export const safeRedirectSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
      return '/dashboard';
    }

    return value;
  });

export async function getHeaderStore() {
  return headers();
}

export async function findProfileUserIdByEmail(email: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return typeof data?.id === 'string' ? data.id : null;
}

export async function assertAuthAllowedByEmail(email: string) {
  const headerStore = await getHeaderStore();
  const userId = await findProfileUserIdByEmail(email);
  await assertAuthAttemptAllowed({
    email,
    userId,
    headers: headerStore,
  });

  return {
    headerStore,
    userId,
  };
}

export async function recordAuthFailure(input: {
  eventType: string;
  email?: string | null;
  userId?: string | null;
  message: string;
}) {
  const headerStore = await getHeaderStore();
  await recordAuthEvent({
    eventType: input.eventType,
    outcome: 'failed',
    email: input.email ?? null,
    userId: input.userId ?? null,
    headers: headerStore,
    details: {
      message: input.message,
    },
  });
}

export async function finalizeSuccessfulAuth(input: {
  userId: string;
  email?: string | null;
  eventType: string;
  sessionSeed: string;
  details?: Record<string, unknown>;
}) {
  const headerStore = await getHeaderStore();
  await assertAuthAttemptAllowed({
    email: input.email ?? null,
    userId: input.userId,
    headers: headerStore,
  });
  await observeSession({
    userId: input.userId,
    email: input.email ?? null,
    headers: headerStore,
    sessionKey: buildSessionKey(input.sessionSeed),
    details: input.details,
  });
  await recordAuthEvent({
    eventType: input.eventType,
    outcome: 'succeeded',
    email: input.email ?? null,
    userId: input.userId,
    headers: headerStore,
  });
}
