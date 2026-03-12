'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookies';

function getBrowserAuthState() {
  if (typeof document === 'undefined' || !document.cookie) {
    return false;
  }

  const cookies = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => ({ name: entry.split('=')[0] ?? '' }));

  return hasSupabaseAuthCookie(cookies);
}

export default function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(getBrowserAuthState());
    };

    syncAuthState();
    window.addEventListener('pageshow', syncAuthState);
    document.addEventListener('visibilitychange', syncAuthState);

    return () => {
      window.removeEventListener('pageshow', syncAuthState);
      document.removeEventListener('visibilitychange', syncAuthState);
    };
  }, [pathname]);

  if (
    isAuthenticated ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/payments')
  ) {
    return null;
  }

  return (
    <Link
      href="https://wa.me/8801813896400"
      target="_blank"
      rel="noreferrer"
      className="fixed z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_rgba(37,211,102,0.32)] transition hover:scale-[1.03] hover:brightness-95"
      style={{
        right: 'max(1rem, env(safe-area-inset-right) + 1rem)',
        bottom: 'max(1.25rem, env(safe-area-inset-bottom) + 1.25rem)',
      }}
      aria-label="WhatsApp-এ মেসেজ করুন"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7 fill-current"
      >
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.6 2 2.19 6.41 2.19 11.84c0 1.74.45 3.43 1.32 4.92L2 22l5.4-1.42a9.8 9.8 0 0 0 4.63 1.18h.01c5.42 0 9.84-4.41 9.84-9.84 0-2.63-1.02-5.1-2.83-6.99Zm-7.02 15.19h-.01a8.15 8.15 0 0 1-4.16-1.14l-.3-.18-3.2.84.86-3.12-.2-.32a8.13 8.13 0 0 1-1.25-4.34c0-4.49 3.66-8.15 8.17-8.15 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.38 5.77c0 4.5-3.66 8.16-8.16 8.16Zm4.47-6.1c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.18-.7-.62-1.17-1.4-1.31-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.43h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 1.99 0 1.17.86 2.3.98 2.46.12.16 1.68 2.57 4.07 3.6.57.25 1.02.4 1.37.5.58.18 1.1.15 1.52.09.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </Link>
  );
}
