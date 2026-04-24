'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BadgeCheck, CalendarDays, Coins, Headphones, LoaderCircle, MessageCircle, ReceiptText, TicketPercent } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { useAuth } from './AuthProvider';
import CheckoutCouponField from './CheckoutCouponField';
import type { CouponPricingRule } from '@/lib/coupons';
import { checkCourseOwnership, getCoursePurchaseDetails, type PurchaseDetails } from '@/lib/purchase-access';
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
  isOwned: boolean;
}

export default function CoursePurchasePanel({ course }: CoursePurchasePanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { supabase, user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const shouldShowToolsCta =
    course.slug === 'n8n-automation-mastery' ||
    course.slug === 'vibe-coding-mastery' ||
    course.slug === 'phone-ai-video-editing';
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
  const [courseAccessHref, setCourseAccessHref] = useState('');

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
          checkCourseOwnership(supabase, user.id, course.slug),
          getCoursePurchaseDetails(supabase, user.id, course.slug),
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
  }, [course.slug, isAuthLoading, supabase, user]);

  useEffect(() => {
    let isMounted = true;

    async function loadCourseAccessHref() {
      try {
        const response = await fetch('/api/courses/access-links');
        const data = (await response.json()) as { links?: Record<string, string> };

        if (isMounted) {
          setCourseAccessHref(data.links?.[course.slug] ?? '');
        }
      } catch {
        if (isMounted) {
          setCourseAccessHref('');
        }
      }
    }

    void loadCourseAccessHref();

    return () => {
      isMounted = false;
    };
  }, [course.slug]);

  const preview = getPricingPreview(
    course.price,
    pricingState.walletBalance,
    pricingState.welcomeDiscountUsesRemaining,
    appliedCoupon,
  );
  const isFreeCourse = preview.finalPrice === 0;

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

  const purchasedOnLabel = purchaseDetails?.purchasedAt
    ? new Date(purchaseDetails.purchasedAt).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

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
      if (isFreeCourse) {
        const response = await fetch('/api/courses/free-enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseSlug: course.slug,
          }),
        });

        const data = (await response.json()) as { ok?: boolean; error?: string };

        if (response.status === 401) {
          router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Free enrollment করা যায়নি।');
        }

        setIsCheckingOut(false);
        router.refresh();
        return;
      }

      const response = await fetch('/api/payments/piprapay/create', {
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
            <span className="text-3xl font-bold text-gray-900">{preview.finalPrice === 0 ? 'FREE' : `৳ ${formatPrice(preview.finalPrice)}`}</span>
            {course.originalPrice > preview.finalPrice && (
              <span className="text-base text-gray-400 line-through">৳ {formatPrice(course.originalPrice)}</span>
            )}
          </div>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
          Lifetime access
        </div>
      </div>

      {pricingState.isOwned && purchaseDetails ? (
        <div className="mb-5 rounded-2xl border border-green-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Already purchased</p>
              <p className="mt-1 text-xs text-gray-500">এই courseটি আপনার account-এ unlocked আছে।</p>
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
              {purchaseDetails.items.map((item) => (
                <div key={`${item.type}:${item.slug}`} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-medium text-gray-700">{item.title}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
                    {item.type}
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
              <span className="text-2xl font-bold text-gray-900">{isFreeCourse ? 'FREE' : `৳ ${formatPrice(preview.finalPrice)}`}</span>
            </div>
          </div>
        </div>
      )}

      {!pricingState.isOwned && !isFreeCourse && (
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
        {course.featureMetrics.slice(0, 3).map((feature) => (
          <p key={feature} className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand" />
            {feature}
          </p>
        ))}
      </div>

      {(pricingState.isLoading ||
        pricingState.isOwned ||
        pricingState.welcomeDiscountUsesRemaining > 0 ||
        !pricingState.isAuthenticated) && (
        <div className="mt-5 rounded-2xl bg-brand/5 p-4 text-sm text-gray-600">
          {pricingState.isLoading ? (
            <div className="flex items-center gap-2 text-brand">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>আপনার wallet ও referral সুবিধা load হচ্ছে...</span>
            </div>
          ) : pricingState.isOwned ? (
            <p>এই courseটি আপনার account-এ already unlocked আছে। আবার payment লাগবে না।</p>
          ) : pricingState.welcomeDiscountUsesRemaining > 0 ? (
            <p>আপনার account-এ referral discount active আছে। প্রথম নতুন course-এ ১০% off পাবেন।</p>
          ) : (
            <p>এই course detail public, তবে payment start করার আগে sign in করতে হবে।</p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {pricingState.isOwned ? (
          <Link
            href={
              shouldShowToolsCta
                ? '/templates'
                : purchaseDetails?.accessHref || courseAccessHref || `/courses/${course.slug}`
            }
            className="block w-full rounded-2xl bg-brand px-6 py-3.5 text-center font-bold text-white shadow-lg transition hover:bg-brand-dark"
          >
            {shouldShowToolsCta ? 'tools কিনুন' : 'কোর্সে যান'}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="block w-full rounded-2xl bg-brand px-6 py-3.5 text-center font-bold text-white shadow-lg transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCheckingOut
              ? isFreeCourse
                ? 'Enroll হচ্ছে...'
                : 'Pay হচ্ছে...'
              : pricingState.isAuthenticated
                ? isFreeCourse
                  ? 'এখনই Enroll করুন'
                  : `৳ ${formatPrice(preview.finalPrice)} Pay করুন`
                : isFreeCourse
                  ? 'Enroll করার আগে sign in করুন'
                  : 'Pay করার আগে sign in করুন'}
          </button>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {pricingState.isOwned ? (
            <Link
              href="/dashboard?tab=owned"
              className="block w-full rounded-2xl border border-green-100 bg-green-50 px-6 py-3.5 text-center font-bold text-green-700 transition hover:bg-green-100"
            >
              আমার কোর্সে দেখুন
            </Link>
          ) : (
            !isFreeCourse ? (
              <AddToCartButton
                item={{ type: 'course', slug: course.slug }}
                className="w-full"
                defaultLabel="কার্টে যোগ করুন"
                addedLabel="কার্টে আছে"
              />
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-green-100 bg-green-50 px-6 py-3.5 text-center font-bold text-green-700">
                Free course, instant access
              </div>
            )
          )}
          <Link
            href={pricingState.isOwned ? '/dashboard?tab=support' : '/dashboard?tab=refer'}
            className="block w-full rounded-2xl border border-brand/20 bg-white px-6 py-3.5 text-center font-bold text-brand transition hover:bg-brand/5"
          >
            {pricingState.isOwned ? 'সাপোর্ট দেখুন' : 'Refer সেন্টার'}
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
