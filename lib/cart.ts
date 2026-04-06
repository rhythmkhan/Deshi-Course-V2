import { BUNDLE_CATALOG } from './bundle-catalog';
import {
  calculateCouponDiscount,
  getCouponEligibleSubtotal,
  type AppliedCoupon,
  type CouponPricingRule,
} from './coupons';
import { COURSE_CATALOG } from './course-catalog';
import { REFERRAL_DISCOUNT_RATE } from './referral';
import { SHOP_CATALOG } from './shop-catalog';

export type CartItemType = 'course' | 'bundle' | 'shop';

export interface CartItemInput {
  type: CartItemType;
  slug: string;
}

export interface CartItem extends CartItemInput {
  key: string;
  addedAt: string;
}

export interface CartCatalogItem extends CartItem {
  title: string;
  subtitle: string;
  image: string;
  price: number;
  originalPrice: number;
  badge: string;
  meta: string;
  includedCourseSlugs?: string[];
  includedShopSlugs?: string[];
}

export interface CartPricedItem extends CartCatalogItem {
  effectivePrice: number;
  coveredByBundleTitles: string[];
  isCoveredByBundle: boolean;
}

function roundAmount(value: number) {
  return Number(value.toFixed(2));
}

export function buildCartKey(type: CartItemType, slug: string) {
  return `${type}:${slug}`;
}

export function createCartItem(input: CartItemInput): CartItem {
  return {
    ...input,
    key: buildCartKey(input.type, input.slug),
    addedAt: new Date().toISOString(),
  };
}

export function resolveCartItem(input: CartItemInput): CartCatalogItem | null {
  if (input.type === 'course') {
    const course = COURSE_CATALOG.find((item) => item.slug === input.slug);

    if (!course) {
      return null;
    }

    return {
      ...createCartItem(input),
      title: course.title,
      subtitle: `${course.instructor} • ${course.accessLabel}`,
      image: course.image,
      price: course.price,
      originalPrice: course.originalPrice,
      badge: 'কোর্স',
      meta: `${course.category} • ${course.accessLabel}`,
    };
  }

  if (input.type === 'bundle') {
    const bundle = BUNDLE_CATALOG.find((item) => item.slug === input.slug);

    if (!bundle) {
      return null;
    }

    return {
      ...createCartItem(input),
      title: bundle.title,
      subtitle: bundle.subtitle,
      image: bundle.image,
      price: bundle.bundlePrice,
      originalPrice: bundle.originalPrice,
      badge: 'বান্ডেল',
      meta: bundle.includedShopSlugs?.length
        ? `${bundle.includedCourseSlugs.length} কোর্স + ${bundle.includedShopSlugs.length} resource • ${bundle.highlight}`
        : `${bundle.includedCourseSlugs.length} কোর্স • ${bundle.highlight}`,
      includedCourseSlugs: bundle.includedCourseSlugs,
      includedShopSlugs: bundle.includedShopSlugs,
    };
  }

  const shopItem = SHOP_CATALOG.find((item) => item.slug === input.slug);

  if (!shopItem) {
    return null;
  }

  return {
    ...createCartItem(input),
    title: shopItem.title,
    subtitle: shopItem.description,
    image: shopItem.image,
    price: shopItem.price,
    originalPrice: shopItem.price,
    badge: shopItem.type,
    meta: `${shopItem.format} • ${shopItem.accessLabel}`,
  };
}

export function resolveCartItems(items: CartItemInput[]) {
  return items
    .map((item) => resolveCartItem(item))
    .filter((item): item is CartCatalogItem => Boolean(item));
}

export function getPricedCartItems(items: CartCatalogItem[]): CartPricedItem[] {
  const bundleCoverageMap = new Map<string, string[]>();

  items
    .filter((item) => item.type === 'bundle')
    .forEach((bundle) => {
      bundle.includedCourseSlugs?.forEach((courseSlug) => {
        const bundleKey = buildCartKey('course', courseSlug);
        const currentTitles = bundleCoverageMap.get(bundleKey) ?? [];
        bundleCoverageMap.set(bundleKey, [...currentTitles, bundle.title]);
      });

      bundle.includedShopSlugs?.forEach((shopSlug) => {
        const bundleKey = buildCartKey('shop', shopSlug);
        const currentTitles = bundleCoverageMap.get(bundleKey) ?? [];
        bundleCoverageMap.set(bundleKey, [...currentTitles, bundle.title]);
      });
    });

  return items.map((item) => {
    const coveredByBundleTitles =
      item.type === 'bundle'
        ? []
        : (bundleCoverageMap.get(buildCartKey(item.type, item.slug)) ?? []);
    const isCoveredByBundle = coveredByBundleTitles.length > 0;

    return {
      ...item,
      effectivePrice: isCoveredByBundle ? 0 : item.price,
      coveredByBundleTitles,
      isCoveredByBundle,
    };
  });
}

export function getCartPricingPreview(
  items: CartCatalogItem[],
  walletBalance: number,
  welcomeDiscountUsesRemaining: number,
  coupon?: CouponPricingRule | null,
) {
  const pricedItems = getPricedCartItems(items);
  const catalogSubtotal = roundAmount(items.reduce((total, item) => total + item.price, 0));
  const originalSubtotal = roundAmount(items.reduce((total, item) => total + item.originalPrice, 0));
  const overlapDiscount = roundAmount(
    pricedItems.reduce((total, item) => total + (item.price - item.effectivePrice), 0),
  );
  const listSubtotal = roundAmount(
    pricedItems.reduce((total, item) => total + item.effectivePrice, 0),
  );
  const eligibleCoursePrice =
    welcomeDiscountUsesRemaining > 0
      ? Math.max(
          0,
          ...pricedItems
            .filter((item) => item.type === 'course')
            .map((item) => item.effectivePrice),
        )
      : 0;
  const referralDiscount = roundAmount(eligibleCoursePrice * REFERRAL_DISCOUNT_RATE);
  const subtotalAfterReferral = roundAmount(Math.max(listSubtotal - referralDiscount, 0));
  const couponEligibleSubtotal = coupon
    ? getCouponEligibleSubtotal(pricedItems, coupon, referralDiscount)
    : 0;
  const couponDiscount = coupon
    ? calculateCouponDiscount(couponEligibleSubtotal, coupon)
    : 0;
  const subtotalAfterCoupon = roundAmount(Math.max(subtotalAfterReferral - couponDiscount, 0));
  const walletDiscount = roundAmount(Math.min(walletBalance, subtotalAfterCoupon));
  const finalPrice = roundAmount(Math.max(subtotalAfterCoupon - walletDiscount, 0));
  const appliedCoupon: AppliedCoupon | null =
    coupon && couponDiscount > 0
      ? {
          ...coupon,
          discountAmount: couponDiscount,
        }
      : null;

  return {
    pricedItems,
    catalogSubtotal,
    listSubtotal,
    originalSubtotal,
    overlapDiscount,
    referralDiscount,
    couponDiscount,
    walletDiscount,
    finalPrice,
    itemCount: items.length,
    appliedCoupon,
    hasReferralDiscount: referralDiscount > 0,
    hasCouponDiscount: couponDiscount > 0,
    hasWalletDiscount: walletDiscount > 0,
  };
}
