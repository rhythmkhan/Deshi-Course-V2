import Link from 'next/link';
import { updateOrderAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge, TextArea, deliveryJson, money, shortDate } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

interface OrderRow {
  id: string;
  user_id: string;
  course_slug: string;
  final_amount: number | string | null;
  amount: number | string | null;
  payment_status: string;
  fulfillment_status?: string | null;
  payment_url: string | null;
  coupon_code?: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const status = typeof params.status === 'string' ? params.status.trim() : '';
  const supabase = createAdminClient();
  let query = supabase
    .from('orders')
    .select(
      'id, user_id, course_slug, final_amount, amount, payment_status, fulfillment_status, payment_url, coupon_code, metadata, created_at, profiles(full_name, email)',
    )
    .order('created_at', { ascending: false })
    .limit(24);

  if (status) {
    query = query.eq('payment_status', status);
  }

  if (q) {
    query = query.or(
      `course_slug.ilike.%${q}%,profiles.full_name.ilike.%${q}%,profiles.email.ilike.%${q}%`,
    );
  }

  const { data } = await query;
  const orders = (data as OrderRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <AdminShell
        title="Order Search"
        subtitle="Buyer, item slug, payment status দিয়ে দ্রুত order খুঁজুন।"
      >
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <Input name="q" defaultValue={q} placeholder="Buyer email, name or slug" />
          <Select name="status" defaultValue={status}>
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </Select>
          <ActionButton tone="secondary">Search</ActionButton>
        </form>
      </AdminShell>

      <AdminShell
        title="Orders"
        subtitle="Timeline detail open করুন বা quick status update দিন।"
      >
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[1.8rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={order.payment_status === 'paid' ? 'success' : 'warning'}>
                      {order.payment_status}
                    </StatusBadge>
                    <StatusBadge tone="neutral">
                      {order.fulfillment_status || 'legacy'}
                    </StatusBadge>
                    {order.coupon_code ? <StatusBadge tone="brand">{order.coupon_code}</StatusBadge> : null}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-gray-900">
                    {order.profiles?.full_name || 'Unknown buyer'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.profiles?.email || order.user_id}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand">
                    {money(order.final_amount ?? order.amount)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {order.course_slug} • {shortDate(order.created_at)} • #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="inline-flex rounded-2xl border border-brand/15 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
                >
                  Open timeline
                </Link>
              </div>

              <form action={updateOrderAction} className="mt-4 grid gap-3">
                <input type="hidden" name="order_id" value={order.id} />
                <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                  <Select name="payment_status" defaultValue={order.payment_status}>
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="failed">failed</option>
                    <option value="cancelled">cancelled</option>
                    <option value="refunded">refunded</option>
                  </Select>
                  <Input name="payment_url" defaultValue={order.payment_url ?? ''} placeholder="Payment URL" />
                </div>
                <TextArea
                  name="delivery_links_json"
                  defaultValue={deliveryJson(order.metadata)}
                  placeholder="Delivery links JSON"
                />
                <ActionButton>Save order</ActionButton>
              </form>
            </article>
          ))}

          {orders.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500 xl:col-span-2">
              কোনো order পাওয়া যায়নি।
            </div>
          ) : null}
        </div>
      </AdminShell>
    </div>
  );
}
