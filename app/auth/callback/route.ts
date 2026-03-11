import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { EmailOtpType } from '@supabase/supabase-js';
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
      const redirectUrl = new URL(safeNext, baseUrl);

      if (ref) {
        redirectUrl.searchParams.set('ref', ref);
      }

      return NextResponse.redirect(redirectUrl);
    }

    signInUrl.searchParams.set('error', 'auth_callback_failed');
    signInUrl.searchParams.set('reason', error.message);
    return NextResponse.redirect(signInUrl);
  }

  signInUrl.searchParams.set('error', 'auth_callback_failed');
  signInUrl.searchParams.set('reason', 'missing_auth_code');
  return NextResponse.redirect(signInUrl);
}
