'use client';

import { LoaderCircle, TicketPercent, X } from 'lucide-react';
import type { CouponPricingRule } from '@/lib/coupons';

interface CheckoutCouponFieldProps {
  code: string;
  onCodeChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  isApplying: boolean;
  appliedCoupon: CouponPricingRule | null;
  error: string;
  disabled?: boolean;
}

export default function CheckoutCouponField({
  code,
  onCodeChange,
  onApply,
  onRemove,
  isApplying,
  appliedCoupon,
  error,
  disabled = false,
}: CheckoutCouponFieldProps) {
  return (
    <div className="rounded-2xl border border-dashed border-brand/20 bg-brand/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white p-2 text-brand shadow-sm">
          <TicketPercent className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={code}
              onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
              placeholder="DC-XXXXXXXX"
              className="min-h-11 flex-1 rounded-xl border border-brand/15 bg-white px-4 text-sm font-medium uppercase tracking-[0.18em] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand"
              disabled={disabled || isApplying}
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled || isApplying}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand/20 bg-white px-4 text-sm font-bold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={onApply}
                disabled={disabled || isApplying || !code.trim()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isApplying && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Apply
              </button>
            )}
          </div>
          {appliedCoupon ? (
            <p className="mt-3 text-sm font-medium text-green-700">
              {appliedCoupon.code} applied. {appliedCoupon.description}
            </p>
          ) : null}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
