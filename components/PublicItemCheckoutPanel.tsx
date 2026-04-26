'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BadgeCheck, CalendarDays, Coins, Headphones, LoaderCircle, MessageCircle, ReceiptText, ShoppingBag } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { useAuth } from './AuthProvider';
import CheckoutCouponField from './CheckoutCouponField';
import { getCartPricingPreview, resolveCartItems, type CartItemInput } from '@/lib/cart';
import type { CouponPricingRule } from '@/lib/coupons';
import { checkItemPurchase, getItemPurchaseDetails, type PurchaseDetails } from '@/lib/purchase-access';
import { formatPrice } from '@/lib/referral';
import { generateMetaEventId, trackMetaEvent } from '@/lib/meta-client';
import { buildMetaContentType } from '@/lib/meta';

interface PricingState {
  walletBalance: number;
  welcomeDiscountUsesRemaining: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOwned: boolean;
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
  const searchParams = useSearchParams();
  const { supabase, user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const handledCouponRef = useRef('');
  const [pricingState, setPricingState] = useState<PricingState>({
      walletBalance: 0,
      welcomeDiscountUsesRemaining: 0,
      isAuthenticated: false,
      isLoading: true,
      isOwned: false,
    });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPricingRule | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);

  const resolvedItem = resolveCartItems([item])[0];
  const pricingPreview = resolvedItem
    ? getCartPricingPreview(
        [resolvedItem],
        pricingState.walletBalance,
        pricingState.welcomeDiscountUsesRemaining,
        appliedCoupon,
      )
    : null;
  const couponFromUrl = searchParams.get('coupon') ?? searchParams.get('couponCode') ?? '';

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
            isOwned: false,
          });
          setPurchaseDetails(null);
        }
        return;
      }

      try {
        const [{ data }, isOwned, ownedDetails] = await Promise.all([
          supabase
          .from('profiles')
          .select('wallet_balance, welcome_discount_uses_remaining')
          .eq('id', user.id)
          .single(),
          item.type === 'course'
            ? Promise.resolve(false)
            : checkItemPurchase(supabase, user.id, item as { type: 'bundle' | 'shop'; slug: string }),
          item.type === 'course'
            ? Promise.resolve(null)
            : getItemPurchaseDetails(supabase, user.id, item as { type: 'bundle' | 'shop'; slug: string }),
        ]);

        if (isMounted) {
          setPricingState({
            walletBalance: Number(data?.wallet_balance ?? 0),
            welcomeDiscountUsesRemaining: Number(data?.welcome_discount_uses_remaining ?? 0),
            isAuthenticated: true,
            isLoading: false,
            isOwned,
          });
          setPurchaseDetails(ownedDetails);
        }
      } catch {
        if (isMounted) {
          setPricingState({
            walletBalance: 0,
            welcomeDiscountUsesRemaining: 0,
            isAuthenticated: true,
            isLoading: false,
            isOwned: false,
          });
          setPurchaseDetails(null);
        }
      }
    }

    void loadPricingState();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, item, supabase, user]);

  const applyCouponCode = useCallback(async (code: string) => {
    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [item],
          couponCode: code,
        }),
      });

      const data = (await response.json()) as { coupon?: CouponPricingRule; error?: string };

      if (!response.ok || !data.coupon) {
        setAppliedCoupon(null);
        throw new Error(data.error || 'Coupon apply করা যায়নি।');
      }

      setAppliedCoupon(data.coupon);
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Coupon apply করা যায়নি।');
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [item]);

  useEffect(() => {
    const normalizedCoupon = couponFromUrl.trim().toUpperCase();

    if (!normalizedCoupon || handledCouponRef.current === normalizedCoupon) {
      return;
    }

    handledCouponRef.current = normalizedCoupon;
    setCouponInput(normalizedCoupon);
    void applyCouponCode(normalizedCoupon);
  }, [applyCouponCode, couponFromUrl]);

  async function handleApplyCoupon() {
    await applyCouponCode(couponInput.trim().toUpperCase());
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }

  const purchasedOnLabel = purchaseDetails?.purchasedAt
    ? new Date(purchaseDetails.purchasedAt).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

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
      const response = await fetch('/api/payments/piprapay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [item],
          couponCode: appliedCoupon?.code,
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

      {pricingState.isOwned && purchaseDetails ? (
        <div className="mb-5 rounded-2xl border border-green-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Already purchased</p>
              <p className="mt-1 text-xs text-gray-500">এই itemটি আপনার account-এ unlocked আছে।</p>
            </div>
            <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              Active access
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-2xl bg-green-50/60 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-gray-600">
                <CalendarDays className="h-4 w-4 text-brand" />
                Purchased on
              </span>
              <span className="font-bold text-gray-900">{purchasedOnLabel || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-gray-600">
                <ReceiptText className="h-4 w-4 text-brand" />
                Order reference
              </span>
              <span className="font-bold text-gray-900">#{purchaseDetails.orderId.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-gray-900">যা যা কেনা হয়েছে</p>
            <div className="mt-3 space-y-2">
              {purchaseDetails.items.map((purchaseItem) => (
                <div key={`${purchaseItem.type}:${purchaseItem.slug}`} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-medium text-gray-700">{purchaseItem.title}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
                    {purchaseItem.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-900">Access problem হলে</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a
                href="https://wa.me/8801813896400"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
              >
                <Headphones className="h-4 w-4" />
                WhatsApp support
              </a>
              <a
                href="https://www.messenger.com/t/956128257564286"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-brand/20 bg-white px-4 py-3 text-sm font-bold text-brand transition hover:bg-brand/5"
              >
                <MessageCircle className="h-4 w-4" />
                Messenger support
              </a>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Message-এ purchase email, order reference, আর access problem-এর screenshot পাঠালে দ্রুত solve করা যাবে।
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-brand/10 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">মূল মূল্য</span>
            <span className="font-bold text-gray-900">৳ {formatPrice(resolvedItem.price)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Coupon discount</span>
            <span className="font-bold text-brand">
              {pricingPreview.hasCouponDiscount
                ? `- ৳ ${formatPrice(pricingPreview.couponDiscount)}`
                : '৳ 0.00'}
            </span>
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
      )}

      {!pricingState.isOwned && (
        <div className="mb-5">
          <CheckoutCouponField
            code={couponInput}
            onCodeChange={setCouponInput}
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
            isApplying={isApplyingCoupon}
            appliedCoupon={appliedCoupon}
            error={couponError}
            disabled={isCheckingOut}
          />
        </div>
      )}

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
        ) : pricingState.isOwned ? (
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-brand" />
            <span>এই itemটি আপনার account-এ already unlocked আছে। আবার payment লাগবে না।</span>
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
        {pricingState.isOwned ? (
          <Link
            href={item.type === 'bundle' ? '/dashboard?tab=bundle' : '/products'}
            className="block w-full rounded-2xl bg-brand px-6 py-3.5 text-center font-bold text-white shadow-lg transition hover:bg-brand-dark"
          >
            {item.type === 'bundle' ? 'বান্ডেলে যান' : 'tools কিনুন'}
          </Link>
        ) : (
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
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {pricingState.isOwned ? (
            <div className="flex items-center justify-center rounded-2xl border border-green-100 bg-green-50 px-6 py-3.5 text-center font-bold text-green-700">
              Already purchased
            </div>
          ) : (
            <AddToCartButton
              item={item}
              className="w-full"
              defaultLabel="কার্টে যোগ করুন"
              addedLabel="কার্টে আছে"
            />
          )}
          <Link
            href={pricingState.isOwned ? '/dashboard?tab=support' : '/cart'}
            className="block w-full rounded-2xl border border-brand/20 bg-white px-6 py-3.5 text-center font-bold text-brand transition hover:bg-brand/5"
          >
            {pricingState.isOwned ? 'সাপোর্ট দেখুন' : 'কার্ট দেখুন'}
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

