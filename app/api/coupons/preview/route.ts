import { NextResponse } from 'next/server';
import type { CartItemInput } from '@/lib/cart';
import { getCartPricingPreview, resolveCartItems } from '@/lib/cart';
import { resolveCouponForCheckout } from '@/lib/coupons';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      couponCode?: string;
      items?: CartItemInput[];
      courseSlug?: string;
    };

    const checkoutItems = Array.isArray(body.items)
      ? body.items
      : body.courseSlug
        ? [{ type: 'course', slug: body.courseSlug } satisfies CartItemInput]
        : [];

    if (!checkoutItems.length) {
      return NextResponse.json({ error: 'Coupon preview-এর জন্য item দরকার।' }, { status: 400 });
    }

    const resolvedItems = resolveCartItems(checkoutItems);

    if (!resolvedItems.length) {
      return NextResponse.json({ error: 'Valid item পাওয়া যায়নি।' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let walletBalance = 0;
    let welcomeDiscountUsesRemaining = 0;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance, welcome_discount_uses_remaining')
        .eq('id', user.id)
        .single();

      walletBalance = Number(profile?.wallet_balance ?? 0);
      welcomeDiscountUsesRemaining = Number(profile?.welcome_discount_uses_remaining ?? 0);
    }

    const basePricing = getCartPricingPreview(
      resolvedItems,
      walletBalance,
      welcomeDiscountUsesRemaining,
    );
    const couponResult = await resolveCouponForCheckout({
      code: body.couponCode ?? '',
      pricedItems: basePricing.pricedItems.map((item) => ({
        type: item.type,
        slug: item.slug,
        effectivePrice: item.effectivePrice,
      })),
      referralDiscount: basePricing.referralDiscount,
      userId: user?.id,
    });

    if (!couponResult.coupon) {
      return NextResponse.json({ error: couponResult.error || 'Coupon apply করা যায়নি।' }, { status: 400 });
    }

    const pricingWithCoupon = getCartPricingPreview(
      resolvedItems,
      walletBalance,
      welcomeDiscountUsesRemaining,
      couponResult.coupon,
    );

    return NextResponse.json({
      ok: true,
      coupon: couponResult.coupon,
      discountAmount: pricingWithCoupon.couponDiscount,
      finalAmount: pricingWithCoupon.finalPrice,
      expiresAt: couponResult.coupon.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Coupon preview failed' },
      { status: 500 },
    );
  }
}
