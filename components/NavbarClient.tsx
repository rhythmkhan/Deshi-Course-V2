'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookies';
import BrandLogo from './BrandLogo';

const navLinks = [
  { name: 'কোর্সসমূহ', href: '/courses' },
  { name: 'প্রোডাক্ট', href: '/products' },
  { name: 'ব্লগ', href: '/blog' },
  { name: 'সাপোর্ট', href: '/contact' },
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
      <div className="relative mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-x-4 px-4 py-3 sm:px-6 md:py-4 lg:grid-cols-[auto_1fr_auto] lg:px-20">
        <BrandLogo priority />

        <div className="flex items-center justify-end gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-700"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden items-center justify-center space-x-8 font-medium lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={`relative py-1 transition ${
                pathname === link.href ? 'text-brand' : 'text-gray-700 hover:text-brand'
              }`}
            >
              <span className="relative inline-block">
                {link.name}
                {pathname === link.href && (
                  <span className="absolute inset-x-0 -bottom-1.5 h-0.5 bg-brand" />
                )}
              </span>
            </Link>
          ))}
        </div>

        <div className="hidden justify-end md:flex">
          <Link href={authHref} prefetch={false}>
            <span className="inline-flex rounded-lg bg-brand px-6 py-2 text-white shadow-md transition hover:bg-brand-dark">
              {authLabel}
            </span>
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute inset-x-0 top-full border-t border-white/60 bg-white/78 backdrop-blur-[36px] md:hidden">
          <div className="space-y-2 border-b border-white/50 bg-white/72 px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-base font-medium backdrop-blur-md transition ${
                  pathname === link.href
                    ? 'bg-white/80 text-brand'
                    : 'text-gray-700 hover:bg-white/65'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={authHref}
              prefetch={false}
              onClick={() => setIsMenuOpen(false)}
              className="block pt-2"
            >
              <span className="block w-full rounded-2xl bg-brand px-5 py-3 text-center text-base font-bold text-white shadow-[0_12px_32px_rgba(109,40,217,0.28)]">
                {authLabel}
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

