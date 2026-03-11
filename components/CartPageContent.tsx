'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, LoaderCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { formatPrice } from '@/lib/referral';
import { getCartPricingPreview, resolveCartItems } from '@/lib/cart';
import { generateMetaEventId, trackMetaEvent } from '@/lib/meta-client';
import { buildMetaContentType } from '@/lib/meta';

interface PricingState {
  walletBalance: number;
  welcomeDiscountUsesRemaining: number;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export default function CartPageContent() {
  const router = useRouter();
  const { supabase, user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { items, removeItem, clearCart, isReady } = useCart();
  const [pricingState, setPricingState] = useState<PricingState>({
    walletBalance: 0,
    welcomeDiscountUsesRemaining: 0,
    isAuthenticated: false,
    isLoading: true,
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartItems = resolveCartItems(items);
  const pricingPreview = getCartPricingPreview(
    cartItems,
    pricingState.walletBalance,
    pricingState.welcomeDiscountUsesRemaining,
  );
  const pricedCartItems = pricingPreview.pricedItems;

  useEffect(() => {
    let isMounted = true;

    async function loadPricingState() {
      if (isAuthLoading) {
        return;
      }

      if (!user) {
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
    if (!cartItems.length) {
      return;
    }

    setCheckoutError('');

    if (!isAuthenticated) {
      router.push('/signin?redirect=/cart');
      return;
    }

    setIsCheckingOut(true);

    trackMetaEvent({
      eventName: 'InitiateCheckout',
      eventId: generateMetaEventId('cartcheckout'),
      customData: {
        currency: 'BDT',
        value: pricingPreview.finalPrice,
        content_name: 'Cart checkout',
        content_type: buildMetaContentType('cart', pricedCartItems.length),
        content_ids: pricedCartItems.map((item) => item.slug),
        contents: pricedCartItems.map((item) => ({
          id: item.slug,
          quantity: 1,
          item_price: item.effectivePrice,
        })),
        num_items: pricedCartItems.length,
      },
    });

    try {
      const response = await fetch('/api/payments/zinipay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({ type: item.type, slug: item.slug })),
          source: 'cart',
        }),
      });

      const data = (await response.json()) as { paymentUrl?: string; error?: string };

      if (response.status === 401) {
        router.push('/signin?redirect=/cart');
        return;
      }

      if (!response.ok || !data.paymentUrl) {
        throw new Error(data.error || 'Pay শুরু করা যায়নি।');
      }

      window.location.href = data.paymentUrl;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Pay শুরু করা যায়নি।');
      setIsCheckingOut(false);
    }
  }

  if (!isReady) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-sm">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-4 text-gray-600">কার্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">আপনার কার্ট এখন খালি</h2>
        <p className="mt-3 text-gray-600">
          কোর্স, বান্ডেল বা প্রোডাক্ট যোগ করলে এখানেই pay summary দেখাবে।
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/courses"
            className="rounded-2xl bg-brand px-6 py-3 font-bold text-white transition hover:bg-brand-dark"
          >
            কোর্স দেখুন
          </Link>
          <Link
            href="/templates"
            className="rounded-2xl border border-brand/20 bg-white px-6 py-3 font-bold text-brand transition hover:bg-brand/5"
          >
            প্রোডাক্ট দেখুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_380px]">
      <div className="space-y-4">
        {pricedCartItems.map((item) => (
          <article
            key={item.key}
            className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm sm:grid sm:grid-cols-[220px_minmax(0,1fr)]"
          >
            <div className="relative h-56 sm:h-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized={item.image.startsWith('/api/catalog-art')}
                referrerPolicy="no-referrer"
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand">
                {item.badge}
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 sm:p-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                    <p className="mt-2 text-sm text-gray-500">{item.subtitle}</p>
                    {item.isCoveredByBundle && (
                      <p className="mt-2 text-sm font-medium text-green-600">
                        {item.coveredByBundleTitles.join(', ')}-এর মধ্যে থাকায় এই course-এর জন্য extra charge হবে না।
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem({ type: item.type, slug: item.slug })}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50"
                    aria-label={`${item.title} remove করুন`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-brand/10 px-3 py-1 font-bold text-brand">{item.meta}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-gray-400 line-through">৳ {formatPrice(item.originalPrice)}</span>
                  )}
                  {item.isCoveredByBundle && (
                    <span className="rounded-full bg-green-50 px-3 py-1 font-bold text-green-700">
                      Bundle covered
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs font-medium text-gray-400">মূল্য</p>
                  {item.isCoveredByBundle ? (
                    <div>
                      <p className="text-2xl font-bold text-green-700">৳ 0.00</p>
                      <p className="text-sm text-gray-400 line-through">৳ {formatPrice(item.price)}</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">৳ {formatPrice(item.price)}</p>
                  )}
                </div>
                {item.type === 'course' ? (
                  <Link
                    href={`/courses/${item.slug}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-brand/20 bg-white px-4 py-2.5 text-sm font-bold text-brand transition hover:bg-brand/5"
                  >
                    বিস্তারিত
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href={item.type === 'bundle' ? `/bundles/${item.slug}` : `/templates/${item.slug}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-brand/20 bg-white px-4 py-2.5 text-sm font-bold text-brand transition hover:bg-brand/5"
                  >
                    বিস্তারিত
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Pay Summary</p>
              <h2 className="text-2xl font-bold text-gray-900">একসাথে পেমেন্ট করুন</h2>
            </div>
            <div className="rounded-full bg-brand/10 px-3 py-1 text-sm font-bold text-brand">
              {pricingPreview.itemCount} item
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">৳ {formatPrice(pricingPreview.catalogSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Bundle / sale saving</span>
              <span className="font-bold text-green-600">
                {pricingPreview.originalSubtotal > pricingPreview.catalogSubtotal
                  ? `- ৳ ${formatPrice(pricingPreview.originalSubtotal - pricingPreview.catalogSubtotal)}`
                  : '৳ 0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Bundle overlap saving</span>
              <span className="font-bold text-green-600">
                {pricingPreview.overlapDiscount > 0
                  ? `- ৳ ${formatPrice(pricingPreview.overlapDiscount)}`
                  : '৳ 0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Referral discount</span>
              <span className="font-bold text-brand">
                {pricingPreview.hasReferralDiscount
                  ? `- ৳ ${formatPrice(pricingPreview.referralDiscount)}`
                  : 'Eligible course থাকলে apply হবে'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Wallet deduction</span>
              <span className="font-bold text-brand">
                {pricingPreview.hasWalletDiscount
                  ? `- ৳ ${formatPrice(pricingPreview.walletDiscount)}`
                  : '৳ 0.00'}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Final payable</span>
              <span className="text-2xl font-bold text-gray-900">৳ {formatPrice(pricingPreview.finalPrice)}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              কার্টে course থাকলে referral discount auto-apply হবে, আর wallet balance থাকলে final payable থেকে কেটে যাবে।
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut || pricingState.isLoading}
              className="w-full rounded-2xl bg-brand px-6 py-3.5 text-center font-bold text-white shadow-lg transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCheckingOut
                ? 'Pay হচ্ছে...'
                : pricingState.isAuthenticated
                  ? 'Pay করুন'
                  : 'Pay করার আগে sign in করুন'}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-center font-bold text-gray-700 transition hover:bg-gray-50"
            >
              কার্ট খালি করুন
            </button>
          </div>

          {checkoutError && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {checkoutError}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-brand/5 p-6">
          <h3 className="text-lg font-bold text-gray-900">Practical setup ready</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            এখন user এক order-এ course, bundle আর digital add-on একসাথে pay করতে পারবে। এতে AOV বাড়বে,
            bundle attach-rate বাড়বে, আর payment friction কমবে।
          </p>
        </div>
      </aside>
    </div>
  );
}
