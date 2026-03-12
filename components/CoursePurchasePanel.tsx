'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BadgeCheck, Coins, LoaderCircle, TicketPercent } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { useAuth } from './AuthProvider';
import CheckoutCouponField from './CheckoutCouponField';
import type { CouponPricingRule } from '@/lib/coupons';
import { formatPrice, getPricingPreview } from '@/lib/referral';
import { generateMetaEventId, trackMetaEvent } from '@/lib/meta-client';
import { buildMetaContentType } from '@/lib/meta';

interface CoursePurchasePanelProps {
  course: {
    slug: string;
    title: string;
    price: number;
    originalPrice: number;
    featureMetrics: string[];
  };
}

interface PricingState {
  walletBalance: number;
  welcomeDiscountUsesRemaining: number;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export default function CoursePurchasePanel({ course }: CoursePurchasePanelProps) {
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
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPricingRule | null>(null);

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

  const preview = getPricingPreview(
    course.price,
    pricingState.walletBalance,
    pricingState.welcomeDiscountUsesRemaining,
    appliedCoupon,
  );

  const couponFromUrl = searchParams.get('coupon') ?? searchParams.get('couponCode') ?? '';

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
          courseSlug: course.slug,
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
  }, [course.slug]);

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

  async function handleCheckout() {
    if (!isAuthenticated) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    trackMetaEvent({
      eventName: 'InitiateCheckout',
      eventId: generateMetaEventId('checkout'),
      customData: {
        currency: 'BDT',
        value: preview.finalPrice,
        content_name: course.title,
        content_type: buildMetaContentType('course'),
        content_ids: [course.slug],
        contents: [{ id: course.slug, quantity: 1, item_price: preview.finalPrice }],
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
          courseSlug: course.slug,
          couponCode: appliedCoupon?.code,
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

  return (
    <div className="rounded-[1.5rem] bg-gray-50 p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">কোর্স ফি</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">৳ {formatPrice(preview.finalPrice)}</span>
            {course.originalPrice > preview.finalPrice && (
              <span className="text-base text-gray-400 line-through">৳ {formatPrice(course.originalPrice)}</span>
            )}
          </div>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
          Lifetime access
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-brand/10 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">মূল মূল্য</span>
          <span className="font-bold text-gray-900">৳ {formatPrice(preview.listPrice)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <TicketPercent className="h-4 w-4 text-brand" />
            Referral discount
          </span>
          <span className="font-bold text-brand">
            {preview.hasReferralDiscount ? `- ৳ ${formatPrice(preview.referralDiscount)}` : 'এখনও unlocked না'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <TicketPercent className="h-4 w-4 text-brand" />
            Coupon discount
          </span>
          <span className="font-bold text-brand">
            {preview.hasCouponDiscount ? `- ৳ ${formatPrice(preview.couponDiscount)}` : '৳ 0.00'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Coins className="h-4 w-4 text-brand" />
            Wallet discount
          </span>
          <span className="font-bold text-brand">
            {preview.hasWalletDiscount ? `- ৳ ${formatPrice(preview.walletDiscount)}` : '৳ 0.00'}
          </span>
        </div>
        <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">এখন দিতে হবে</span>
            <span className="text-2xl font-bold text-gray-900">৳ {formatPrice(preview.finalPrice)}</span>
          </div>
        </div>
      </div>

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

      <div className="space-y-3 text-sm text-gray-600">
        {course.featureMetrics.slice(0, 3).map((feature) => (
          <p key={feature} className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand" />
            {feature}
          </p>
        ))}
      </div>

      {(pricingState.isLoading ||
        pricingState.welcomeDiscountUsesRemaining > 0 ||
        !pricingState.isAuthenticated) && (
        <div className="mt-5 rounded-2xl bg-brand/5 p-4 text-sm text-gray-600">
          {pricingState.isLoading ? (
            <div className="flex items-center gap-2 text-brand">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>আপনার wallet ও referral সুবিধা load হচ্ছে...</span>
            </div>
          ) : pricingState.welcomeDiscountUsesRemaining > 0 ? (
            <p>আপনার account-এ referral discount active আছে। প্রথম নতুন course-এ ১০% off পাবেন।</p>
          ) : (
            <p>এই course detail public, তবে payment start করার আগে sign in করতে হবে।</p>
          )}
        </div>
      )}

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
              ? `৳ ${formatPrice(preview.finalPrice)} Pay করুন`
              : 'Pay করার আগে sign in করুন'}
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <AddToCartButton
            item={{ type: 'course', slug: course.slug }}
            className="w-full"
            defaultLabel="কার্টে যোগ করুন"
            addedLabel="কার্টে আছে"
          />
          <Link
            href="/dashboard?tab=refer"
            className="block w-full rounded-2xl border border-brand/20 bg-white px-6 py-3.5 text-center font-bold text-brand transition hover:bg-brand/5"
          >
            Refer সেন্টার
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
