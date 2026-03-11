'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BadgeCheck, Coins, LoaderCircle, ShoppingBag } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { useAuth } from './AuthProvider';
import { getCartPricingPreview, resolveCartItems, type CartItemInput } from '@/lib/cart';
import { formatPrice } from '@/lib/referral';
import { generateMetaEventId, trackMetaEvent } from '@/lib/meta-client';
import { buildMetaContentType } from '@/lib/meta';

interface PricingState {
  walletBalance: number;
  welcomeDiscountUsesRemaining: number;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface PublicItemCheckoutPanelProps {
  item: CartItemInput;
  originalPrice: number;
  highlights: string[];
}

export default function PublicItemCheckoutPanel({
  item,
  originalPrice,
  highlights,
}: PublicItemCheckoutPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { supabase, user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [pricingState, setPricingState] = useState<PricingState>({
    walletBalance: 0,
    welcomeDiscountUsesRemaining: 0,
    isAuthenticated: false,
    isLoading: true,
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const resolvedItem = resolveCartItems([item])[0];
  const pricingPreview = resolvedItem
    ? getCartPricingPreview(
        [resolvedItem],
        pricingState.walletBalance,
        pricingState.welcomeDiscountUsesRemaining,
      )
    : null;

  useEffect(() => {
    let isMounted = true;

    async function loadPricingState() {
      if (isAuthLoading) {
        return;
      }

      if (!user || !supabase) {
        if (isMounted) {
          setPricingState({
            walletBalance: 0,
            welcomeDiscountUsesRemaining: 0,
            isAuthenticated: false,
            isLoading: false,
          });
        }
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('wallet_balance, welcome_discount_uses_remaining')
          .eq('id', user.id)
          .single();

        if (isMounted) {
          setPricingState({
            walletBalance: Number(data?.wallet_balance ?? 0),
            welcomeDiscountUsesRemaining: Number(data?.welcome_discount_uses_remaining ?? 0),
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch {
        if (isMounted) {
          setPricingState({
            walletBalance: 0,
            welcomeDiscountUsesRemaining: 0,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      }
    }

    void loadPricingState();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, supabase, user]);

  async function handleCheckout() {
    if (!resolvedItem || !pricingPreview) {
      return;
    }

    setCheckoutError('');

    if (!isAuthenticated) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsCheckingOut(true);

    trackMetaEvent({
      eventName: 'InitiateCheckout',
      eventId: generateMetaEventId('checkout'),
      customData: {
        currency: 'BDT',
        value: pricingPreview.finalPrice,
        content_name: resolvedItem.title,
        content_type: buildMetaContentType(item.type),
        content_ids: [resolvedItem.slug],
        contents: [{ id: resolvedItem.slug, quantity: 1, item_price: pricingPreview.finalPrice }],
        num_items: 1,
      },
    });

    try {
      const response = await fetch('/api/payments/zinipay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [item],
          source: 'cart',
        }),
      });

      const data = (await response.json()) as { paymentUrl?: string; error?: string };

      if (response.status === 401) {
        router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!response.ok || !data.paymentUrl) {
        throw new Error(data.error || 'Payment start করা যায়নি।');
      }

      window.location.href = data.paymentUrl;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Payment start করা যায়নি।');
      setIsCheckingOut(false);
    }
  }

  if (!resolvedItem || !pricingPreview) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] bg-gray-50 p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">অফার মূল্য</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">৳ {formatPrice(pricingPreview.finalPrice)}</span>
            {originalPrice > pricingPreview.finalPrice && (
              <span className="text-base text-gray-400 line-through">৳ {formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
        <div className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
          Public Detail
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-brand/10 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">মূল মূল্য</span>
          <span className="font-bold text-gray-900">৳ {formatPrice(resolvedItem.price)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">Wallet discount</span>
          <span className="font-bold text-brand">
            {pricingPreview.hasWalletDiscount
              ? `- ৳ ${formatPrice(pricingPreview.walletDiscount)}`
              : 'Sign in করলে check হবে'}
          </span>
        </div>
        <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">এখন দিতে হবে</span>
            <span className="text-2xl font-bold text-gray-900">৳ {formatPrice(pricingPreview.finalPrice)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Details public, তবে payment-এর আগে sign in করতে হবে।
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        {highlights.map((highlight) => (
          <p key={highlight} className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand" />
            {highlight}
          </p>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-brand/5 p-4 text-sm text-gray-600">
        {pricingState.isLoading ? (
          <div className="flex items-center gap-2 text-brand">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>আপনার wallet benefit check হচ্ছে...</span>
          </div>
        ) : pricingState.isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-brand" />
            <span>Sign in করা আছে, তাই payable amount-এ wallet deduction already reflect করছে।</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-brand" />
            <span>এখনই cart-এ যোগ করতে পারবেন, checkout-এর আগে sign in লাগবে।</span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="block w-full rounded-2xl bg-brand px-6 py-3.5 text-center font-bold text-white shadow-lg transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCheckingOut
            ? 'Pay হচ্ছে...'
            : pricingState.isAuthenticated
              ? `৳ ${formatPrice(pricingPreview.finalPrice)} Pay করুন`
              : 'Pay করার আগে sign in করুন'}
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <AddToCartButton
            item={item}
            className="w-full"
            defaultLabel="কার্টে যোগ করুন"
            addedLabel="কার্টে আছে"
          />
          <Link
            href="/cart"
            className="block w-full rounded-2xl border border-brand/20 bg-white px-6 py-3.5 text-center font-bold text-brand transition hover:bg-brand/5"
          >
            কার্ট দেখুন
          </Link>
        </div>
      </div>

      {checkoutError && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {checkoutError}
        </div>
      )}
    </div>
  );
}
