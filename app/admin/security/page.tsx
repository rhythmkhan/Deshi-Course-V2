import Link from 'next/link';
import { blockIpAction, unblockIpAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, StatusBadge, shortDate } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminSecurityPage() {
  const supabase = createAdminClient();
  const [ipBlocksResult, authEventsResult, riskEventsResult, blockedUsersResult] = await Promise.all([
    supabase
      .from('auth_ip_blocks')
      .select('ip_address, reason, blocked_by, expires_at, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('auth_events')
      .select('id, email, event_type, outcome, ip_address, risk_score, created_at')
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('login_risk_events')
      .select('id, email, user_id, risk_score, risk_level, reasons, ip_address, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('profiles')
      .select('id, full_name, email, blocked_reason, blocked_at')
      .eq('is_blocked', true)
      .order('blocked_at', { ascending: false })
      .limit(20),
  ]);

  const ipBlocks =
    (ipBlocksResult.data as Array<{
      ip_address: string;
      reason: string | null;
      blocked_by: string | null;
      expires_at: string | null;
      created_at: string;
    }> | null) ?? [];
  const authEvents =
    (authEventsResult.data as Array<{
      id: string;
      email: string | null;
      event_type: string;
      outcome: string;
      ip_address: string | null;
      risk_score: number;
      created_at: string;
    }> | null) ?? [];
  const riskEvents =
    (riskEventsResult.data as Array<{
      id: string;
      email: string | null;
      user_id: string | null;
      risk_score: number;
      risk_level: string;
      reasons: string[] | null;
      ip_address: string | null;
      created_at: string;
    }> | null) ?? [];
  const blockedUsers =
    (blockedUsersResult.data as Array<{
      id: string;
      full_name: string | null;
      email: string | null;
      blocked_reason: string | null;
      blocked_at: string | null;
    }> | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <AdminShell title="Block IP" subtitle="Suspicious IP, bot traffic, abuse source block করুন।">
          <form action={blockIpAction} className="grid gap-3">
            <Input name="ip_address" placeholder="IP address" required />
            <Input name="reason" placeholder="Reason" />
            <Input name="expires_at" placeholder="Expires at (optional ISO date)" />
            <ActionButton tone="danger">Block IP</ActionButton>
          </form>
        </AdminShell>

        <AdminShell
          title="Blocked Users"
          subtitle="User block list. detail page থেকে unblock/force re-auth manage করুন।"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {blockedUsers.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="block rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand/20"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge tone="danger">Blocked</StatusBadge>
                </div>
                <p className="mt-3 font-bold text-gray-900">{user.full_name || 'Unknown user'}</p>
                <p className="mt-1 text-sm text-gray-500">{user.email || user.id}</p>
                <p className="mt-2 text-sm text-red-700">{user.blocked_reason || 'No reason saved'}</p>
              </Link>
            ))}
          </div>
        </AdminShell>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <AdminShell title="IP Blocks" subtitle="Current blocked IP addresses।">
          <div className="space-y-3">
            {ipBlocks.map((block) => (
              <div key={block.ip_address} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="font-bold text-gray-900">{block.ip_address}</p>
                <p className="mt-1 text-sm text-gray-500">
                  By {block.blocked_by || 'admin'} • {shortDate(block.created_at)}
                </p>
                <p className="mt-2 text-sm text-gray-600">{block.reason || 'No reason saved'}</p>
                {block.expires_at ? (
                  <p className="mt-2 text-xs text-amber-700">Expires {shortDate(block.expires_at)}</p>
                ) : null}
                <form action={unblockIpAction} className="mt-4">
                  <input type="hidden" name="ip_address" value={block.ip_address} />
                  <ActionButton tone="secondary">Unblock IP</ActionButton>
                </form>
              </div>
            ))}
          </div>
        </AdminShell>

        <AdminShell title="Auth Events" subtitle="Recent sign-in, sign-up, reset attempts।">
          <div className="space-y-3">
            {authEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={event.outcome === 'succeeded' ? 'success' : 'danger'}>
                    {event.outcome}
                  </StatusBadge>
                  <StatusBadge tone="neutral">{event.event_type}</StatusBadge>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">{event.email || 'Unknown email'}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {event.ip_address || 'Unknown IP'} • risk {event.risk_score} • {shortDate(event.created_at)}
                </p>
              </div>
            ))}
          </div>
        </AdminShell>

        <AdminShell title="Risk Events" subtitle="Suspicious session/login signals।">
          <div className="space-y-3">
            {riskEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={event.risk_level === 'critical' || event.risk_level === 'high' ? 'danger' : 'warning'}>
                    {event.risk_level}
                  </StatusBadge>
                  <StatusBadge tone="neutral">{event.risk_score}</StatusBadge>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">
                  {event.email || event.user_id || 'Unknown user'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {event.ip_address || 'Unknown IP'} • {shortDate(event.created_at)}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {(event.reasons ?? []).join(', ') || 'No reasons recorded'}
                </p>
              </div>
            ))}
          </div>
        </AdminShell>
      </div>
    </div>
  );
}
