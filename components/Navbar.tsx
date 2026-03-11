'use client';

import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { useOptionalAuth } from './AuthProvider';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authContext = useOptionalAuth();
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(false);

  const navLinks = [
    { name: 'হোম', href: '/' },
    { name: 'আমাদের সম্পর্কে', href: '/about' },
    { name: 'কোর্সসমূহ', href: '/courses' },
    { name: 'ব্লগ', href: '/blog' },
    { name: 'যোগাযোগ', href: '/contact' },
  ];

  useEffect(() => {
    if (authContext) {
      return;
    }

    const supabase = createClient();
    let isMounted = true;

    async function syncSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setLocalIsAuthenticated(Boolean(session?.user));
        }
      } catch {
        if (isMounted) {
          setLocalIsAuthenticated(false);
        }
      }
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) {
        return;
      }

      setLocalIsAuthenticated(Boolean(session?.user));
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [authContext]);

  const isAuthenticated = authContext?.isAuthenticated ?? localIsAuthenticated;
  const authHref = isAuthenticated ? '/dashboard' : '/signin';
  const authLabel = isAuthenticated ? 'ড্যাশবোর্ড' : 'সাইন ইন';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-3 md:py-4 flex justify-between items-center">
        <BrandLogo priority />

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-8 font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`transition relative py-1 ${
                pathname === link.href ? 'text-brand after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand' : 'hover:text-brand'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href={authHref}>
            <span className="inline-flex rounded-lg bg-brand px-6 py-2 text-white shadow-md transition hover:bg-brand-dark">
              {authLabel}
            </span>
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-base font-medium transition ${
                  pathname === link.href
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href={authHref} className="block pt-2" onClick={() => setIsMenuOpen(false)}>
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
