'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

interface CartLinkProps {
  mode?: 'pill' | 'icon';
  className?: string;
}

export default function CartLink({ mode = 'pill', className = '' }: CartLinkProps) {
  const { itemCount, isReady } = useCart();
  const countLabel = isReady ? itemCount : 0;

  if (mode === 'icon') {
    return (
      <Link
        href="/cart"
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-brand/20 hover:text-brand ${className}`.trim()}
        aria-label="কার্ট"
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
          {countLabel}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      className={`inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-brand/20 hover:text-brand ${className}`.trim()}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <ShoppingBag className="h-4 w-4" />
        <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
          {countLabel}
        </span>
      </span>
      <span>কার্ট</span>
    </Link>
  );
}
