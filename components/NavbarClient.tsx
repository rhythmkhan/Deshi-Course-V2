'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookies';
import BrandLogo from './BrandLogo';

const navLinks = [
  { name: 'হোম', href: '/' },
  { name: 'আমাদের সম্পর্কে', href: '/about' },
  { name: 'কোর্সসমূহ', href: '/courses' },
  { name: 'ব্লগ', href: '/blog' },
  { name: 'যোগাযোগ', href: '/contact' },
];

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

export default function NavbarClient() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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

  const authHref = isAuthenticated ? '/dashboard' : '/signin';
  const authLabel = isAuthenticated ? 'ড্যাশবোর্ড' : 'সাইন ইন';

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:py-4 lg:px-20">
        <BrandLogo priority />

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden items-center space-x-8 font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={`relative py-1 transition ${
                pathname === link.href
                  ? 'text-brand after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand'
                  : 'text-gray-700 hover:text-brand'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href={authHref} prefetch={false}>
            <span className="inline-flex rounded-lg bg-brand px-6 py-2 text-white shadow-md transition hover:bg-brand-dark">
              {authLabel}
            </span>
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white/95 backdrop-blur-md md:hidden">
          <div className="space-y-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={`block rounded-2xl px-4 py-3 text-base font-medium transition ${
                  pathname === link.href
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href={authHref} prefetch={false} className="block pt-2">
              <span className="block w-full rounded-2xl bg-brand px-5 py-3 text-center text-base font-bold text-white shadow-md">
                {authLabel}
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
