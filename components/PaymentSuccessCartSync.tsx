'use client';

import { useEffect } from 'react';
import { useCart } from './CartProvider';

interface PaymentSuccessCartSyncProps {
  shouldClearCart: boolean;
}

export default function PaymentSuccessCartSync({ shouldClearCart }: PaymentSuccessCartSyncProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (!shouldClearCart) {
      return;
    }

    clearCart();
  }, [clearCart, shouldClearCart]);

  return null;
}
