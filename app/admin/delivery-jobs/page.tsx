import { processDeliveryQueueAction, retryDeliveryJobAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, StatusBadge, shortDate } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminDeliveryJobsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('delivery_jobs')
    .select(
      'id, user_id, item_type, item_slug, channel, status, attempt_count, next_retry_at, last_error, updated_at, order_id',
    )
    .order('updated_at', { ascending: false })
    .limit(40);

  const jobs =
    (data as Array<{
      id: string;
      user_id: string;
      item_type: string;
      item_slug: string;
      channel: string;
      status: string;
      attempt_count: number;
      next_retry_at: string | null;
      last_error: string | null;
      updated_at: string | null;
      order_id: string | null;
    }> | null) ?? [];

  return (
    <div className="space-y-8">
      <AdminShell
        title="Delivery Queue"
        subtitle="Telegram, Drive, email delivery queue এখান থেকে monitor/retry করুন।"
      >
        <form action={processDeliveryQueueAction}>
          <ActionButton>Process pending queue</ActionButton>
        </form>
      </AdminShell>

      <AdminShell
        title="Delivery Jobs"
        subtitle="Failed job retry, pending queue, attempt counts এবং latest error একসাথে।"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-[1.7rem] border border-gray-100 bg-white p-5 shadow-sm">
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
                <StatusBadge tone="neutral">{job.item_type}</StatusBadge>
              </div>
              <p className="mt-3 text-lg font-bold text-gray-900">{job.item_slug}</p>
              <p className="mt-1 text-sm text-gray-500">
                User {job.user_id.slice(0, 8)} • Order {job.order_id?.slice(0, 8) || 'manual'}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Attempts {job.attempt_count} • updated {shortDate(job.updated_at)}
              </p>
              {job.next_retry_at ? (
                <p className="mt-1 text-sm text-amber-700">
                  Next retry {shortDate(job.next_retry_at)}
                </p>
              ) : null}
              {job.last_error ? (
                <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {job.last_error}
                </p>
              ) : null}
              {job.status !== 'completed' ? (
                <form action={retryDeliveryJobAction} className="mt-4">
                  <input type="hidden" name="job_id" value={job.id} />
                  <ActionButton tone="secondary">Retry job</ActionButton>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
