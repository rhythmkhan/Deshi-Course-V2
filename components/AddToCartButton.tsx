'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ShoppingBag } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { resolveCartItem, type CartItemInput } from '@/lib/cart';
import { generateMetaEventId, trackMetaEvent } from '@/lib/meta-client';
import { buildMetaContentType } from '@/lib/meta';

interface AddToCartButtonProps {
  item: CartItemInput;
  className?: string;
  defaultLabel?: string;
  addedLabel?: string;
  mobileLabel?: string;
  mobileAddedLabel?: string;
  hideIconOnMobile?: boolean;
}

export default function AddToCartButton({
  item,
  className = '',
  defaultLabel = 'কার্টে যোগ করুন',
  addedLabel = 'কার্টে আছে',
  mobileLabel,
  mobileAddedLabel,
  hideIconOnMobile = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { addItem, hasItem, isReady } = useCart();
  const [isJustAdded, setIsJustAdded] = useState(false);
  const inCart = hasItem(item);

  function handleAddToCart() {
    if (!isAuthenticated) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (inCart) {
      return;
    }

    const wasAdded = addItem(item);

    if (wasAdded) {
      const catalogItem = resolveCartItem(item);

      if (catalogItem) {
        trackMetaEvent({
          eventName: 'AddToCart',
          eventId: generateMetaEventId('addtocart'),
          customData: {
            currency: 'BDT',
            value: catalogItem.price,
            content_name: catalogItem.title,
            content_type: buildMetaContentType(item.type),
            content_ids: [catalogItem.slug],
            contents: [{ id: catalogItem.slug, quantity: 1, item_price: catalogItem.price }],
            num_items: 1,
          },
        });
      }

      setIsJustAdded(true);
      window.setTimeout(() => setIsJustAdded(false), 1800);
    }
  }

  const isAddedState = isAuthenticated && (inCart || isJustAdded);
  const desktopLabel = isAddedState ? addedLabel : isAuthenticated ? defaultLabel : 'সাইন ইন করুন';
  const responsiveMobileLabel = isAddedState
    ? mobileAddedLabel ?? addedLabel
    : isAuthenticated
      ? mobileLabel ?? defaultLabel
      : 'সাইন ইন';

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!isReady || (isAuthenticated && inCart)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-2xl border border-brand/20 bg-white px-5 py-3 text-center text-sm font-bold leading-tight text-brand transition hover:bg-brand/5 disabled:cursor-not-allowed disabled:border-green-200 disabled:bg-green-50 disabled:text-green-700 sm:gap-2 ${className}`.trim()}
    >
      <span className={hideIconOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'}>
        {isAddedState ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      </span>
      <span className="sm:hidden">{responsiveMobileLabel}</span>
      <span className="hidden sm:inline">{desktopLabel}</span>
    </button>
  );
}
