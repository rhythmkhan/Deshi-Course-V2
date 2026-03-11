'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import FloatingCartBubble from '@/components/FloatingCartBubble';

export default function CommerceProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <FloatingCartBubble />
      </CartProvider>
    </AuthProvider>
  );
}
