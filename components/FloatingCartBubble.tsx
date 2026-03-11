'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';

export default function FloatingCartBubble() {
  const pathname = usePathname();
  const { itemCount, isReady } = useCart();
  const { isAuthenticated } = useAuth();
  const countLabel = isReady ? itemCount : 0;
  const isDashboard = pathname.startsWith('/dashboard');

  if (
    !isAuthenticated ||
    pathname === '/cart' ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup')
  ) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="fixed right-4 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_18px_40px_rgba(109,40,217,0.28)] transition hover:bg-brand-dark sm:right-6"
      style={{
        bottom: isDashboard
          ? 'calc(env(safe-area-inset-bottom) + 5.5rem)'
          : 'calc(env(safe-area-inset-bottom) + 1.25rem)',
      }}
      aria-label="কার্ট খুলুন"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
        <ShoppingBag className="h-4 w-4" />
      </span>
      <span className="absolute right-1 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-brand">
        {countLabel}
      </span>
    </Link>
  );
}
