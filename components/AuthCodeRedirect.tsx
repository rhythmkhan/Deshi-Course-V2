'use client';

import { useEffect } from 'react';

export default function AuthCodeRedirect() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);

    if (currentUrl.pathname === '/auth/callback') {
      return;
    }

    const hasAuthCode = currentUrl.searchParams.has('code');
    const hasOtpParams =
      currentUrl.searchParams.has('token_hash') && currentUrl.searchParams.has('type');

    if (!hasAuthCode && !hasOtpParams) {
      return;
    }

    const callbackUrl = new URL('/auth/callback', currentUrl.origin);

    currentUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value);
    });

    window.location.replace(callbackUrl.toString());
  }, []);

  return null;
}
