import {
  calculateCouponDiscount,
  type AppliedCoupon,
  type CouponPricingRule,
} from './coupons';

export const REFERRAL_DISCOUNT_RATE = 0.1;
export const REFERRER_WALLET_CREDIT = 10;

function roundAmount(value: number) {
  return Number(value.toFixed(2));
}

export function formatPrice(value: number) {
  return roundAmount(value).toFixed(2);
}

export function buildFallbackReferralCode(fullName: string, email: string) {
  const baseSource = (fullName || email.split('@')[0] || 'DESHI')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6)
    .padEnd(6, 'X');

  const hashSource = `${fullName}:${email}`.toUpperCase();
  let hash = 0;

  for (let index = 0; index < hashSource.length; index += 1) {
    hash = (hash * 31 + hashSource.charCodeAt(index)) % 65535;
  }

  return `${baseSource}${hash.toString(16).toUpperCase().padStart(4, '0').slice(0, 4)}`;
}

export function getPricingPreview(
  price: number,
  walletBalance: number,
  welcomeDiscountUsesRemaining: number,
  coupon?: CouponPricingRule | null,
) {
  const listPrice = roundAmount(price);
  const referralDiscount =
    welcomeDiscountUsesRemaining > 0 ? roundAmount(listPrice * REFERRAL_DISCOUNT_RATE) : 0;
  const subtotalAfterReferral = roundAmount(listPrice - referralDiscount);
  const couponEligibleSubtotal =
    coupon && (coupon.appliesTo === 'all' || coupon.appliesTo === 'course')
      ? subtotalAfterReferral
      : 0;
  const couponDiscount =
    couponEligibleSubtotal > 0 && coupon
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
    listPrice,
    referralDiscount,
    couponDiscount,
    walletDiscount,
    finalPrice,
    appliedCoupon,
    hasReferralDiscount: referralDiscount > 0,
    hasCouponDiscount: couponDiscount > 0,
    hasWalletDiscount: walletDiscount > 0,
  };
}
