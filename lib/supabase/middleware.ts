import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminEmail } from '@/lib/admin-access';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookies';
import {
  isMissingColumnError,
  isMissingFunctionError,
} from '@/lib/supabase/errors';
import { getClientIpFromHeaders } from '@/lib/rate-limit';

const AUTH_PAGES = ['/signin', '/signup', '/forgot-password'];
const PROTECTED_PAGES = ['/admin', '/cart', '/dashboard'];
const IP_GUARDED_PAGES = ['/admin', '/signin', '/signup', '/forgot-password'];

function matchesPath(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedPath(pathname: string) {
  return matchesPath(pathname, PROTECTED_PAGES);
}

function shouldCheckIpBlock(pathname: string) {
  return matchesPath(pathname, IP_GUARDED_PAGES);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (shouldCheckIpBlock(pathname)) {
    const ipAddress = getClientIpFromHeaders(request.headers);

    if (ipAddress && ipAddress !== 'unknown') {
      const ipCheck = await supabase.rpc('is_ip_blocked', {
        candidate_ip: ipAddress,
      });

      if (ipCheck.data === true) {
        if (hasSupabaseAuthCookie(request.cookies.getAll())) {
          await supabase.auth.signOut();
        }

        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/signin';
        redirectUrl.search = '';
        redirectUrl.searchParams.set('error', 'access_blocked');
        redirectUrl.searchParams.set('reason', 'ip_blocked');
        return NextResponse.redirect(redirectUrl);
      }

      if (ipCheck.error && !isMissingFunctionError(ipCheck.error, 'is_ip_blocked')) {
        throw ipCheck.error;
      }
    }
  }

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    redirectUrl.search = '';
    redirectUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const profileResult = await supabase
      .from('profiles')
      .select('is_blocked, force_reauth_after')
      .eq('id', user.id)
      .maybeSingle();

    if (
      profileResult.error &&
      !isMissingColumnError(profileResult.error, 'is_blocked') &&
      !isMissingColumnError(profileResult.error, 'force_reauth_after')
    ) {
      throw profileResult.error;
    }

    const isBlocked = profileResult.data?.is_blocked === true;
    const forceReauthAfter = profileResult.data?.force_reauth_after ?? null;
    const shouldForceReauth =
      typeof forceReauthAfter === 'string' &&
      (!user.last_sign_in_at || forceReauthAfter > user.last_sign_in_at);

    if (isBlocked || shouldForceReauth) {
      await supabase.auth.signOut();

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/signin';
      redirectUrl.search = '';
      redirectUrl.searchParams.set(
        'error',
        isBlocked ? 'access_blocked' : 'session_revoked',
      );

      if (isBlocked) {
        redirectUrl.searchParams.set('reason', 'এই account-এর access বর্তমানে বন্ধ আছে।');
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && pathname.startsWith('/admin') && !isAdminEmail(user.email)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  if (user && matchesPath(pathname, AUTH_PAGES)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminEmail(user.email) ? '/admin' : '/dashboard';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
