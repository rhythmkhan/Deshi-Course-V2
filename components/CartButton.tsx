'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

interface CartButtonProps {
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
}

export default function CartButton({
  className = '',
  labelClassName = '',
  showLabel = false,
}: CartButtonProps) {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className={`relative inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-brand/30 hover:text-brand ${className}`}
      aria-label="কার্ট"
    >
      <ShoppingCart className="h-5 w-5" />
      {showLabel && <span className={`ml-2 text-sm font-bold ${labelClassName}`}>কার্ট</span>}
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
