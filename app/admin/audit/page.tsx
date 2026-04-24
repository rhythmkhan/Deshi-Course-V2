import { AdminShell, StatusBadge, shortDate } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminAuditPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('admin_audit_logs')
    .select('id, admin_email, action, target_type, target_id, summary, details, ip_address, created_at')
    .order('created_at', { ascending: false })
    .limit(40);

  const logs =
    (data as Array<{
      id: string;
      admin_email: string;
      action: string;
      target_type: string;
      target_id: string | null;
      summary: string;
      details: Record<string, unknown> | null;
      ip_address: string | null;
      created_at: string;
    }> | null) ?? [];

  return (
    <AdminShell
      title="Admin Audit Log"
      subtitle="সব critical admin action append-only timeline হিসেবে এখানে থাকবে।"
    >
      <div className="space-y-4">
        {logs.map((log) => (
          <article key={log.id} className="rounded-[1.7rem] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="brand">{log.action}</StatusBadge>
              <StatusBadge tone="neutral">{log.target_type}</StatusBadge>
            </div>
            <h3 className="mt-3 text-lg font-bold text-gray-900">{log.summary}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {log.admin_email} • {shortDate(log.created_at)}
              {log.target_id ? ` • ${log.target_id}` : ''}
              {log.ip_address ? ` • ${log.ip_address}` : ''}
            </p>
            {log.details ? (
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            ) : null}
          </article>
        ))}

        {logs.length === 0 ? (
          <div className="rounded-[1.6rem] border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            এখনো কোনো admin audit log নেই।
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
