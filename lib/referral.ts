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
) {
  const listPrice = roundAmount(price);
  const referralDiscount =
    welcomeDiscountUsesRemaining > 0 ? roundAmount(listPrice * REFERRAL_DISCOUNT_RATE) : 0;
  const subtotalAfterReferral = roundAmount(listPrice - referralDiscount);
  const walletDiscount = roundAmount(Math.min(walletBalance, subtotalAfterReferral));
  const finalPrice = roundAmount(Math.max(subtotalAfterReferral - walletDiscount, 0));

  return {
    listPrice,
    referralDiscount,
    walletDiscount,
    finalPrice,
    hasReferralDiscount: referralDiscount > 0,
    hasWalletDiscount: walletDiscount > 0,
  };
}
