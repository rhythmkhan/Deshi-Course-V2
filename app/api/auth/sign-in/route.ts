import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminEmail } from '@/lib/admin-access';
import { createClient } from '@/lib/supabase/server';
import {
  assertAuthAllowedByEmail,
  finalizeSuccessfulAuth,
  noStoreHeaders,
  recordAuthFailure,
  safeRedirectSchema,
} from '@/app/api/auth/shared';

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  redirectTo: safeRedirectSchema,
});

export async function POST(request: Request) {
  let email = '';

  try {
    const body = signInSchema.parse(await request.json());
    email = body.email.trim().toLowerCase();

    const { userId } = await assertAuthAllowedByEmail(email);
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: body.password,
    });

    if (error) {
      await recordAuthFailure({
        eventType: 'password_sign_in',
        email,
        userId,
        message: error.message,
      });

      return NextResponse.json(
        { error: error.message },
        { status: 401, headers: noStoreHeaders },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      await recordAuthFailure({
        eventType: 'password_sign_in',
        email,
        userId,
        message: 'User session was not created after successful sign-in.',
      });

      return NextResponse.json(
        { error: 'Sign in সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।' },
        { status: 500, headers: noStoreHeaders },
      );
    }

    try {
      await finalizeSuccessfulAuth({
        userId: user.id,
        email: user.email,
        eventType: 'password_sign_in',
        sessionSeed: `${user.id}:${user.last_sign_in_at ?? new Date().toISOString()}`,
      });
    } catch (error) {
      await supabase.auth.signOut();
      await recordAuthFailure({
        eventType: 'password_sign_in',
        email: user.email ?? email,
        userId: user.id,
        message: error instanceof Error ? error.message : 'Blocked during auth finalization.',
      });

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'এই account দিয়ে sign in করা যাবে না।',
        },
        { status: 403, headers: noStoreHeaders },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        redirectTo: isAdminEmail(user.email) ? '/admin' : body.redirectTo,
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Sign in করা যায়নি। পরে আবার চেষ্টা করুন।';

    if (email) {
      await recordAuthFailure({
        eventType: 'password_sign_in',
        email,
        message,
      });
    }

    return NextResponse.json(
      { error: message },
      { status: 400, headers: noStoreHeaders },
    );
  }
}
