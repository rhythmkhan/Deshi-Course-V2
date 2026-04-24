import { deleteCouponAction, toggleCouponAction, upsertCouponAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number | string;
  applies_to: string;
  is_active: boolean;
  usage_limit?: number | null;
  per_user_limit?: number | null;
  single_use?: boolean | null;
  starts_at?: string | null;
  expires_at?: string | null;
}

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  const [{ data: couponData }, { data: redemptionData }, { data: ruleData }] = await Promise.all([
    supabase
      .from('coupons')
      .select(
        'id, code, description, discount_type, discount_value, applies_to, is_active, usage_limit, per_user_limit, single_use, starts_at, expires_at',
      )
      .order('created_at', { ascending: false })
      .limit(32),
    supabase
      .from('coupon_redemptions')
      .select('coupon_code')
      .limit(500),
    supabase
      .from('coupon_item_rules')
      .select('coupon_id, mode, item_type, item_slug')
      .limit(500),
  ]);

  const coupons = (couponData as CouponRow[] | null) ?? [];
  const redemptions = (redemptionData as Array<{ coupon_code: string }> | null) ?? [];
  const rules =
    (ruleData as Array<{
      coupon_id: string;
      mode: string;
      item_type: string;
      item_slug: string;
    }> | null) ?? [];

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <AdminShell title="Coupon Builder" subtitle="One-time, per-user, targeted coupon create করুন।">
        <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
          <form action={upsertCouponAction} className="grid gap-3">
            <Input name="code" placeholder="DC-OFFER" required />
            <Input name="description" placeholder="Internal/public description" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select name="discount_type" defaultValue="fixed">
                <option value="fixed">fixed</option>
                <option value="percent">percent</option>
              </Select>
              <Input name="discount_value" type="number" step="0.01" placeholder="Discount amount" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select name="applies_to" defaultValue="all">
                <option value="all">all items</option>
                <option value="course">course</option>
                <option value="bundle">bundle</option>
                <option value="shop">product</option>
              </Select>
              <Input name="min_order_amount" type="number" placeholder="Minimum spend" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="target_item_type" placeholder="Target item type" />
              <Input name="target_slug" placeholder="Target slug" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="usage_limit" type="number" placeholder="Usage cap" />
              <Input name="per_user_limit" type="number" placeholder="Per-user cap" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="starts_at" placeholder="Starts at (ISO optional)" />
              <Input name="expires_at" placeholder="Expires at (ISO optional)" />
            </div>
            <Input name="include_rules" placeholder="Include rules (one per line, e.g. course:slug)" />
            <Input name="exclude_rules" placeholder="Exclude rules (one per line, e.g. shop:slug)" />
            <div className="flex flex-wrap gap-4 rounded-2xl border border-brand/10 bg-brand/5 px-4 py-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-2">
                <input type="hidden" name="is_active" value="false" />
                <input type="checkbox" name="is_active" value="true" defaultChecked className="h-4 w-4" />
                Active
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="hidden" name="single_use" value="false" />
                <input type="checkbox" name="single_use" value="true" className="h-4 w-4" />
                One time total
              </label>
            </div>
            <ActionButton>Save coupon</ActionButton>
          </form>
        </div>
      </AdminShell>

      <AdminShell title="Coupon List" subtitle="Analytics, scope, usage এবং on/off controls।">
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((coupon) => {
            const usageCount = redemptions.filter((entry) => entry.coupon_code === coupon.code).length;
            const couponRules = rules.filter((entry) => entry.coupon_id === coupon.id);

            return (
              <article key={coupon.id} className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{coupon.code}</h3>
                      <StatusBadge tone={coupon.is_active ? 'success' : 'warning'}>
                        {coupon.is_active ? 'Active' : 'Off'}
                      </StatusBadge>
                      {coupon.single_use ? <StatusBadge tone="brand">One-time</StatusBadge> : null}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {coupon.discount_type} {coupon.discount_value} • {coupon.applies_to}
                    </p>
                    {coupon.description ? (
                      <p className="mt-2 text-sm text-gray-500">{coupon.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-gray-500">
                      Used {usageCount}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                      {coupon.per_user_limit ? ` • per user ${coupon.per_user_limit}` : ''}
                    </p>
                    {coupon.starts_at || coupon.expires_at ? (
                      <p className="mt-1 text-xs text-gray-500">
                        {coupon.starts_at ? `Starts ${coupon.starts_at}` : 'No start'} •{' '}
                        {coupon.expires_at ? `Ends ${coupon.expires_at}` : 'No expiry'}
                      </p>
                    ) : null}
                    {couponRules.length > 0 ? (
                      <p className="mt-2 text-xs text-brand">
                        Rules: {couponRules.map((rule) => `${rule.mode}:${rule.item_type}:${rule.item_slug}`).join(', ')}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={toggleCouponAction}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <input type="hidden" name="is_active" value={String(!coupon.is_active)} />
                    <ActionButton tone="secondary">
                      {coupon.is_active ? 'Turn off' : 'Turn on'}
                    </ActionButton>
                  </form>
                  <form action={deleteCouponAction}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <ActionButton tone="danger">Delete</ActionButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </AdminShell>
    </div>
  );
}
