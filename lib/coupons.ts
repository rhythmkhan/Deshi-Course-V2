import crypto from 'crypto';
import { SITE_URL } from '@/lib/site-url';
import { createAdminClient } from '@/lib/supabase/admin';

export type CouponScope = 'all' | 'course' | 'bundle' | 'shop';
export type CouponDiscountType = 'percent' | 'fixed';
export type CouponItemType = 'course' | 'bundle' | 'shop';
export type TelegramCouponCatalogType = 'course' | 'bundle' | 'product';

export interface CouponPricingRule {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  appliesTo: CouponScope;
  maxDiscountAmount: number | null;
  singleUse: boolean;
  targetItemType: CouponItemType | null;
  targetSlug: string | null;
  productSource: string | null;
  expiresAt: string | null;
}

export interface AppliedCoupon extends CouponPricingRule {
  discountAmount: number;
}

interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number | string;
  applies_to: CouponScope;
  min_order_amount: number | string | null;
  max_discount_amount: number | string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  single_use: boolean | null;
  target_item_type: CouponItemType | null;
  target_slug: string | null;
  product_source: string | null;
  redeemed_at: string | null;
}

interface CouponPricedItemLike {
  type: CouponItemType;
  slug: string;
  effectivePrice: number;
}

export interface TelegramCouponTarget {
  catalogType: TelegramCouponCatalogType;
  itemType: CouponItemType;
  slug: string;
  title: string;
  path: string;
  price: number;
}

const COUPON_PREFIX = 'DC';
const COUPON_LENGTH = 8;
const COUPON_TTL_MS = 24 * 60 * 60 * 1000;

function roundAmount(value: number) {
  return Number(value.toFixed(2));
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function nowIso() {
  return new Date().toISOString();
}

function generateCouponCode() {
  const bytes = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `${COUPON_PREFIX}-${bytes.slice(0, COUPON_LENGTH)}`;
}

function itemTypeToScope(itemType: CouponItemType): CouponScope {
  return itemType;
}

function getMatchingItems(
  pricedItems: CouponPricedItemLike[],
  coupon: Pick<CouponPricingRule, 'appliesTo' | 'targetItemType' | 'targetSlug'>,
) {
  return pricedItems.filter((item) => {
    const matchesScope = coupon.appliesTo === 'all' || coupon.appliesTo === item.type;
    const matchesType = !coupon.targetItemType || coupon.targetItemType === item.type;
    const matchesSlug = !coupon.targetSlug || coupon.targetSlug === item.slug;

    return matchesScope && matchesType && matchesSlug;
  });
}

function mapCouponRule(row: CouponRow): CouponPricingRule {
  return {
    code: row.code,
    description: row.description || row.code,
    discountType: row.discount_type,
    discountValue: toNumber(row.discount_value),
    appliesTo: row.applies_to,
    maxDiscountAmount:
      row.max_discount_amount === null ? null : toNumber(row.max_discount_amount),
    singleUse: row.single_use === true,
    targetItemType: row.target_item_type,
    targetSlug: row.target_slug,
    productSource: row.product_source,
    expiresAt: row.expires_at,
  };
}

export function normalizeCouponCode(value: string | null | undefined) {
  return (value ?? '').trim().toUpperCase();
}

export function calculateCouponDiscount(
  eligibleSubtotal: number,
  coupon: Pick<CouponPricingRule, 'discountType' | 'discountValue' | 'maxDiscountAmount'>,
) {
  if (eligibleSubtotal <= 0) {
    return 0;
  }

  const rawDiscount =
    coupon.discountType === 'percent'
      ? eligibleSubtotal * (coupon.discountValue / 100)
      : coupon.discountValue;

  const cappedDiscount = Math.min(
    rawDiscount,
    eligibleSubtotal,
    coupon.maxDiscountAmount ?? Number.POSITIVE_INFINITY,
  );

  return roundAmount(Math.max(cappedDiscount, 0));
}

export function getCouponEligibleSubtotal(
  pricedItems: CouponPricedItemLike[],
  coupon: Pick<CouponPricingRule, 'appliesTo' | 'targetItemType' | 'targetSlug'>,
  referralDiscount: number,
) {
  const matchingItems = getMatchingItems(pricedItems, coupon);
  const subtotal = matchingItems.reduce((total, item) => total + item.effectivePrice, 0);
  const hasCourseItems = matchingItems.some((item) => item.type === 'course');
  const adjustedSubtotal = hasCourseItems ? Math.max(subtotal - referralDiscount, 0) : subtotal;

  return roundAmount(adjustedSubtotal);
}

export function buildTelegramCouponLink(code: string, path: string) {
  const url = new URL(path, SITE_URL);
  url.searchParams.set('coupon', code);
  return url.toString();
}

export async function createCoupon(params: {
  discountAmount: number;
  target: TelegramCouponTarget;
  issuedBy?: string;
  orderId?: string;
}) {
  if (!params.target.slug || !params.target.title || !params.target.path) {
    throw new Error('Coupon target পাওয়া যায়নি।');
  }

  if (!Number.isFinite(params.target.price) || params.target.price <= 0) {
    throw new Error('Target item price পাওয়া যায়নি।');
  }

  if (params.discountAmount >= params.target.price) {
    throw new Error('Discount amount offer price-এর চেয়ে কম হতে হবে।');
  }

  const supabase = createAdminClient();
  const startsAt = nowIso();
  const expiresAt = new Date(Date.now() + COUPON_TTL_MS).toISOString();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCouponCode();
    const { error } = await supabase.from('coupons').insert({
      code,
      description: `${params.target.title} coupon`,
      discount_type: 'fixed',
      discount_value: params.discountAmount,
      applies_to: itemTypeToScope(params.target.itemType),
      target_item_type: params.target.itemType,
      target_slug: params.target.slug,
      product_source: `telegram:${params.target.catalogType}:${params.target.slug}`,
      order_id: params.orderId ?? null,
      issued_by: params.issuedBy ?? null,
      starts_at: startsAt,
      expires_at: expiresAt,
      single_use: true,
      usage_limit: 1,
      is_active: true,
    });

    if (!error) {
      return {
        code,
        target: params.target,
        expiresAt,
        finalAmount: roundAmount(params.target.price - params.discountAmount),
      };
    }
  }

  throw new Error('Coupon create করা যায়নি।');
}

export async function resolveCouponForCheckout(params: {
  code: string;
  pricedItems: CouponPricedItemLike[];
  referralDiscount: number;
  userId?: string;
}) {
  const normalizedCode = normalizeCouponCode(params.code);

  if (!normalizedCode) {
    return { coupon: null, error: 'কুপন কোড দিন।' };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('coupons')
    .select(
      'id, code, description, discount_type, discount_value, applies_to, min_order_amount, max_discount_amount, usage_limit, per_user_limit, starts_at, expires_at, is_active, single_use, target_item_type, target_slug, product_source, redeemed_at',
    )
    .eq('code', normalizedCode)
    .maybeSingle();

  if (error) {
    throw new Error('Coupon lookup করা যায়নি।');
  }

  const couponRow = data as CouponRow | null;

  if (!couponRow || !couponRow.is_active) {
    return { coupon: null, error: 'এই coupon code টি valid না।' };
  }

  if (couponRow.redeemed_at) {
    return { coupon: null, error: 'এই coupon ইতিমধ্যে ব্যবহার করা হয়েছে।' };
  }

  const nowMs = Date.now();

  if (couponRow.starts_at && new Date(couponRow.starts_at).getTime() > nowMs) {
    return { coupon: null, error: 'এই coupon এখনো active হয়নি।' };
  }

  if (couponRow.expires_at && new Date(couponRow.expires_at).getTime() < nowMs) {
    return { coupon: null, error: 'এই coupon-এর মেয়াদ শেষ।' };
  }

  const pricingRule = mapCouponRule(couponRow);
  const eligibleSubtotal = getCouponEligibleSubtotal(
    params.pricedItems,
    pricingRule,
    params.referralDiscount,
  );

  if (eligibleSubtotal <= 0) {
    return { coupon: null, error: 'এই coupon বর্তমান item-গুলোর জন্য apply হবে না।' };
  }

  if (eligibleSubtotal < toNumber(couponRow.min_order_amount)) {
    return {
      coupon: null,
      error: `এই coupon apply করতে কমপক্ষে ৳ ${roundAmount(toNumber(couponRow.min_order_amount)).toFixed(2)} eligible amount লাগবে।`,
    };
  }

  if (couponRow.usage_limit !== null) {
    const { count, error: usageError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_code', normalizedCode)
      .eq('payment_status', 'paid');

    if (usageError) {
      throw new Error('Coupon usage check করা যায়নি।');
    }

    if ((count ?? 0) >= couponRow.usage_limit) {
      return { coupon: null, error: 'এই coupon-এর usage limit শেষ।' };
    }
  }

  if (couponRow.per_user_limit !== null) {
    if (!params.userId) {
      return { coupon: null, error: 'এই coupon apply করতে sign in করুন।' };
    }

    const { count, error: perUserError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_code', normalizedCode)
      .eq('payment_status', 'paid')
      .eq('user_id', params.userId);

    if (perUserError) {
      throw new Error('Coupon usage check করা যায়নি।');
    }

    if ((count ?? 0) >= couponRow.per_user_limit) {
      return { coupon: null, error: 'আপনি এই coupon-এর usage limit শেষ করেছেন।' };
    }
  }

  return {
    coupon: pricingRule,
    error: null,
  };
}

export async function redeemCouponForOrder(params: { code: string; orderId: string }) {
  const normalizedCode = normalizeCouponCode(params.code);

  if (!normalizedCode) {
    throw new Error('Coupon code missing');
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('coupons')
    .update({
      redeemed_at: nowIso(),
      redeemed_order_id: params.orderId,
    })
    .eq('code', normalizedCode)
    .eq('single_use', true)
    .is('redeemed_at', null)
    .select('code')
    .maybeSingle();

  if (error || !data) {
    throw new Error('Coupon invalid or already used');
  }

  return data;
}
