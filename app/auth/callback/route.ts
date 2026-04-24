import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { EmailOtpType } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin-access';
import {
  finalizeSuccessfulAuth,
  recordAuthFailure,
} from '@/app/api/auth/shared';
import { getRequestSiteUrl } from '@/lib/site-url';
import { createClient } from '@/lib/supabase/server';

const OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

function getSafeNext(next: string | null, otpType: string | null) {
  if (otpType === 'recovery') {
    return '/update-password';
  }

  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }

  return '/dashboard';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const headerStore = await headers();
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const otpType = searchParams.get('type');
  const next = searchParams.get('next');
  const ref = searchParams.get('ref');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description') || searchParams.get('error');

  const safeNext = getSafeNext(next, otpType);
  const baseUrl = getRequestSiteUrl({ request, headers: headerStore });
  const signInUrl = new URL('/signin', baseUrl);

  if (errorCode || errorDescription) {
    signInUrl.searchParams.set('error', 'auth_callback_failed');

    if (errorDescription) {
      signInUrl.searchParams.set('reason', errorDescription);
    }

    return NextResponse.redirect(signInUrl);
  }

  if (code || (tokenHash && otpType && OTP_TYPES.has(otpType as EmailOtpType))) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          type: otpType as EmailOtpType,
          token_hash: tokenHash as string,
        });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await finalizeSuccessfulAuth({
            userId: user.id,
            email: user.email,
            eventType: 'auth_callback',
            sessionSeed: `${user.id}:${user.last_sign_in_at ?? new Date().toISOString()}`,
            details: {
              otpType: otpType ?? null,
            },
          });
        } catch (authError) {
          await supabase.auth.signOut();
          await recordAuthFailure({
            eventType: 'auth_callback',
            email: user.email ?? null,
            userId: user.id,
            message:
              authError instanceof Error
                ? authError.message
                : 'Auth callback blocked during finalization.',
          });
          signInUrl.searchParams.set('error', 'access_blocked');
          signInUrl.searchParams.set(
            'reason',
            authError instanceof Error
              ? authError.message
              : 'এই account দিয়ে sign in করা যাবে না।',
          );
          return NextResponse.redirect(signInUrl);
        }
      }

      const resolvedNext = isAdminEmail(user?.email, process.env.ADMIN_EMAIL_ALLOWLIST)
        ? '/admin'
        : safeNext;
      const redirectUrl = new URL(resolvedNext, baseUrl);

      if (ref) {
        redirectUrl.searchParams.set('ref', ref);
      }

      return NextResponse.redirect(redirectUrl);
    }

    await recordAuthFailure({
      eventType: 'auth_callback',
      message: error.message,
    });
    signInUrl.searchParams.set('error', 'auth_callback_failed');
    signInUrl.searchParams.set('reason', error.message);
    return NextResponse.redirect(signInUrl);
  }

  signInUrl.searchParams.set('error', 'auth_callback_failed');
  signInUrl.searchParams.set('reason', 'missing_auth_code');
  return NextResponse.redirect(signInUrl);
}
