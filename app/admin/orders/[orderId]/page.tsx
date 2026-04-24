import { updateOrderAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge, TextArea, deliveryJson, money, shortDate } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

interface OrderRow {
  id: string;
  user_id: string;
  course_slug: string;
  payment_status: string;
  fulfillment_status?: string | null;
  payment_provider?: string | null;
  final_amount: number | string | null;
  amount: number | string | null;
  coupon_code?: string | null;
  payment_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  paid_at?: string | null;
  provider_invoice_id?: string | null;
  provider_transaction_id?: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = createAdminClient();
  const orderResult = await supabase
    .from('orders')
    .select(
      'id, user_id, course_slug, payment_status, fulfillment_status, payment_provider, final_amount, amount, coupon_code, payment_url, metadata, created_at, paid_at, provider_invoice_id, provider_transaction_id, profiles(full_name, email, phone)',
    )
    .eq('id', orderId)
    .single();
  const order = orderResult.data as OrderRow | null;

  if (!order) {
    return (
      <AdminShell title="Order Not Found" subtitle="এই order id-এর কোনো record পাওয়া যায়নি।">
        <p className="text-sm text-gray-500">Order ID: {orderId}</p>
      </AdminShell>
    );
  }

  const [itemsResult, eventsResult, transactionsResult, entitlementsResult, jobsResult] = await Promise.all([
    supabase
      .from('order_items')
      .select('id, item_type, item_slug, item_title, unit_price, original_price')
      .eq('order_id', orderId),
    supabase
      .from('order_events')
      .select('id, event_type, actor_type, actor_id, summary, details, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false }),
    supabase
      .from('payment_transactions')
      .select('id, provider, status, amount, currency, provider_invoice_id, provider_transaction_id, verification_source, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_entitlements')
      .select('id, item_type, item_slug, item_title, status, delivery_state, granted_at')
      .eq('order_id', orderId)
      .order('granted_at', { ascending: false }),
    supabase
      .from('delivery_jobs')
      .select('id, item_type, item_slug, channel, status, attempt_count, last_error, updated_at')
      .eq('order_id', orderId)
      .order('updated_at', { ascending: false }),
  ]);

  const items =
    (itemsResult.data as Array<{
      id: string;
      item_type: string;
      item_slug: string;
      item_title: string;
      unit_price: number | string;
      original_price?: number | string | null;
    }> | null) ?? [];
  const events =
    (eventsResult.data as Array<{
      id: string;
      event_type: string;
      actor_type: string | null;
      actor_id: string | null;
      summary: string | null;
      details: Record<string, unknown> | null;
      created_at: string;
    }> | null) ?? [];
  const transactions =
    (transactionsResult.data as Array<{
      id: string;
      provider: string;
      status: string;
      amount: number | string | null;
      currency: string | null;
      provider_invoice_id: string | null;
      provider_transaction_id: string | null;
      verification_source: string | null;
      created_at: string;
    }> | null) ?? [];
  const entitlements =
    (entitlementsResult.data as Array<{
      id: string;
      item_type: string;
      item_slug: string;
      item_title: string;
      status: string;
      delivery_state: string | null;
      granted_at: string | null;
    }> | null) ?? [];
  const jobs =
    (jobsResult.data as Array<{
      id: string;
      item_type: string;
      item_slug: string;
      channel: string;
      status: string;
      attempt_count: number;
      last_error?: string | null;
      updated_at: string | null;
    }> | null) ?? [];

  return (
    <div className="space-y-8">
      <AdminShell
        title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        subtitle="Payment, fulfillment timeline, entitlements আর delivery queue state।"
      >
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={order.payment_status === 'paid' ? 'success' : 'warning'}>
                {order.payment_status}
              </StatusBadge>
              <StatusBadge tone="neutral">
                {order.fulfillment_status || 'legacy'}
              </StatusBadge>
              {order.coupon_code ? <StatusBadge tone="brand">{order.coupon_code}</StatusBadge> : null}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Buyer</p>
                <p className="mt-2">{order.profiles?.full_name || 'Unknown buyer'}</p>
                <p className="mt-1">{order.profiles?.email || order.user_id}</p>
                <p className="mt-1">{order.profiles?.phone || 'No phone'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Payment</p>
                <p className="mt-2">Amount {money(order.final_amount ?? order.amount)}</p>
                <p className="mt-1">Provider {order.payment_provider || 'N/A'}</p>
                <p className="mt-1">Invoice {order.provider_invoice_id || 'N/A'}</p>
                <p className="mt-1">Txn {order.provider_transaction_id || 'N/A'}</p>
              </div>
            </div>

            <form action={updateOrderAction} className="mt-5 grid gap-3">
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
                defaultValue={deliveryJson(order.metadata ?? null)}
                placeholder="Delivery links JSON"
              />
              <ActionButton>Save order</ActionButton>
            </form>
          </div>

          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-900">Order items</p>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone="brand">{item.item_type}</StatusBadge>
                  </div>
                  <p className="mt-3 font-bold text-gray-900">{item.item_title}</p>
                  <p className="mt-1 text-sm text-gray-500">{item.item_slug}</p>
                  <p className="mt-2 text-sm font-semibold text-brand">{money(item.unit_price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminShell>

      <div className="grid gap-8 xl:grid-cols-3">
        <AdminShell title="Payment Timeline" subtitle="Gateway verify, webhook, reconciliation events।">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={transaction.status === 'paid' ? 'success' : 'warning'}>
                    {transaction.status}
                  </StatusBadge>
                  <StatusBadge tone="neutral">
                    {transaction.verification_source || 'unknown'}
                  </StatusBadge>
                </div>
                <p className="mt-3 font-bold text-gray-900">
                  {transaction.provider} • {money(transaction.amount)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {transaction.provider_invoice_id || 'No invoice'} • {shortDate(transaction.created_at)}
                </p>
              </div>
            ))}
          </div>
        </AdminShell>

        <AdminShell title="Entitlements" subtitle="Order fulfilment থেকে কোন access grant হয়েছে।">
          <div className="space-y-3">
            {entitlements.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="brand">{entry.item_type}</StatusBadge>
                  <StatusBadge tone={entry.status === 'active' ? 'success' : 'danger'}>
                    {entry.status}
                  </StatusBadge>
                  <StatusBadge tone="neutral">
                    Delivery {entry.delivery_state || 'n/a'}
                  </StatusBadge>
                </div>
                <p className="mt-3 font-bold text-gray-900">{entry.item_title}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {entry.item_slug} • {shortDate(entry.granted_at)}
                </p>
              </div>
            ))}
          </div>
        </AdminShell>

        <AdminShell title="Delivery Jobs" subtitle="Provider status, retries, latest errors।">
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="brand">{job.channel}</StatusBadge>
                  <StatusBadge
                    tone={
                      job.status === 'completed'
                        ? 'success'
                        : job.status === 'failed'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {job.status}
                  </StatusBadge>
                </div>
                <p className="mt-3 font-bold text-gray-900">
                  {job.item_type}:{job.item_slug}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Attempts {job.attempt_count} • {shortDate(job.updated_at)}
                </p>
                {job.last_error ? (
                  <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {job.last_error}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </AdminShell>
      </div>

      <AdminShell title="Order Events" subtitle="Append-only operational event timeline।">
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="brand">{event.event_type}</StatusBadge>
                <StatusBadge tone="neutral">{event.actor_type || 'system'}</StatusBadge>
              </div>
              <p className="mt-3 font-bold text-gray-900">{event.summary || event.event_type}</p>
              <p className="mt-1 text-sm text-gray-500">
                {shortDate(event.created_at)} {event.actor_id ? `• ${event.actor_id}` : ''}
              </p>
              {event.details ? (
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
