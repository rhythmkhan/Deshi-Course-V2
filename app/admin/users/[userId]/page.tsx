import Link from 'next/link';
import {
  addUserAdminNoteAction,
  blockUserAction,
  forceReauthUserAction,
  grantAccessAction,
  revokeAccessAction,
  unblockUserAction,
  updateUserProfileAction,
} from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge, TextArea, money, shortDate } from '@/lib/admin-ui';
import { listPurchasableTitlesBySlug, listUserEntitlements } from '@/lib/entitlements';
import { createAdminClient } from '@/lib/supabase/admin';

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | string | null;
  created_at: string;
  is_blocked?: boolean | null;
  blocked_reason?: string | null;
  risk_score?: number | string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  last_seen_user_agent?: string | null;
  force_reauth_after?: string | null;
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = createAdminClient();
  const profileResult = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, phone, wallet_balance, created_at, is_blocked, blocked_reason, risk_score, last_login_at, last_login_ip, last_seen_user_agent, force_reauth_after',
    )
    .eq('id', userId)
    .single();

  const profile = profileResult.data as ProfileRow | null;

  if (!profile) {
    return (
      <AdminShell title="User Not Found" subtitle="এই user id-এর কোনো profile পাওয়া যায়নি।">
        <Link href="/admin/users" className="text-sm font-semibold text-brand">
          Users page-এ ফিরে যান
        </Link>
      </AdminShell>
    );
  }

  const [authUserResult, entitlements, notesResult, ordersResult, jobsResult, riskResult, sessionResult] =
    await Promise.all([
      supabase.auth.admin.getUserById(userId),
      listUserEntitlements(userId),
      supabase
        .from('user_admin_notes')
        .select('id, note, admin_email, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('orders')
        .select('id, payment_status, fulfillment_status, final_amount, coupon_code, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('delivery_jobs')
        .select('id, item_type, item_slug, channel, status, attempt_count, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(12),
      supabase
        .from('login_risk_events')
        .select('id, risk_score, risk_level, reasons, created_at, ip_address')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('session_observations')
        .select('id, ip_address, user_agent, country_code, city, seen_at')
        .eq('user_id', userId)
        .order('seen_at', { ascending: false })
        .limit(10),
    ]);

  const authUser = authUserResult.data.user;
  const notes =
    (notesResult.data as Array<{
      id: string;
      note: string;
      admin_email: string;
      created_at: string;
    }> | null) ?? [];
  const orders =
    (ordersResult.data as Array<{
      id: string;
      payment_status: string;
      fulfillment_status?: string | null;
      final_amount: number | string | null;
      coupon_code?: string | null;
      created_at: string;
    }> | null) ?? [];
  const jobs =
    (jobsResult.data as Array<{
      id: string;
      item_type: string;
      item_slug: string;
      channel: string;
      status: string;
      attempt_count: number;
      updated_at: string | null;
    }> | null) ?? [];
  const riskEvents =
    (riskResult.data as Array<{
      id: string;
      risk_score: number;
      risk_level: string;
      reasons: string[] | null;
      created_at: string;
      ip_address: string | null;
    }> | null) ?? [];
  const sessions =
    (sessionResult.data as Array<{
      id: string;
      ip_address: string | null;
      user_agent: string | null;
      country_code: string | null;
      city: string | null;
      seen_at: string | null;
    }> | null) ?? [];
  const purchasable = await listPurchasableTitlesBySlug();
  const accessOptions = [
    ...Array.from(purchasable.courses.entries()).map(([slug, title]) => ({
      itemType: 'course' as const,
      slug,
      title,
    })),
    ...Array.from(purchasable.bundles.entries()).map(([slug, title]) => ({
      itemType: 'bundle' as const,
      slug,
      title,
    })),
    ...Array.from(purchasable.products.entries()).map(([slug, title]) => ({
      itemType: 'shop' as const,
      slug,
      title,
    })),
  ].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-8">
      <AdminShell
        title={profile.full_name || profile.email || 'User details'}
        subtitle="Profile, access, security events, orders আর internal notes এক জায়গায়।"
      >
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={profile.is_blocked ? 'danger' : 'success'}>
                {profile.is_blocked ? 'Blocked' : 'Active'}
              </StatusBadge>
              <StatusBadge tone="brand">Risk {Number(profile.risk_score ?? 0)}</StatusBadge>
              <StatusBadge tone={authUser?.email_confirmed_at ? 'success' : 'warning'}>
                {authUser?.email_confirmed_at ? 'Email confirmed' : 'Pending confirm'}
              </StatusBadge>
            </div>

            <form
              action={updateUserProfileAction}
              className="mt-5 grid gap-3 md:grid-cols-2"
            >
              <input type="hidden" name="user_id" value={userId} />
              <Input name="full_name" defaultValue={profile.full_name ?? ''} placeholder="Full name" />
              <Input name="phone" defaultValue={profile.phone ?? ''} placeholder="Phone number" />
              <div className="md:col-span-2">
                <ActionButton>Save profile</ActionButton>
              </div>
            </form>

            <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Contact</p>
                <p className="mt-2">{profile.email || 'N/A'}</p>
                <p className="mt-1">{profile.phone || 'No phone'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Account state</p>
                <p className="mt-2">Joined {shortDate(profile.created_at)}</p>
                <p className="mt-1">Wallet {money(profile.wallet_balance)}</p>
                <p className="mt-1">Last login {shortDate(profile.last_login_at)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-900">Security actions</p>
            <p className="mt-1 text-sm text-gray-500">Login block, force re-auth, current IP/device insight।</p>
            <div className="mt-4 grid gap-3">
              {profile.is_blocked ? (
                <form action={unblockUserAction}>
                  <input type="hidden" name="user_id" value={userId} />
                  <ActionButton tone="secondary">Unblock user</ActionButton>
                </form>
              ) : (
                <form action={blockUserAction} className="grid gap-3">
                  <input type="hidden" name="user_id" value={userId} />
                  <Input name="reason" placeholder="Why block this user?" />
                  <ActionButton tone="danger">Block user</ActionButton>
                </form>
              )}

              <form action={forceReauthUserAction}>
                <input type="hidden" name="user_id" value={userId} />
                <ActionButton tone="secondary">Force re-auth</ActionButton>
              </form>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
              <p>Last IP: {profile.last_login_ip || 'N/A'}</p>
              <p className="mt-1 break-all">
                Device: {profile.last_seen_user_agent || 'N/A'}
              </p>
              {profile.blocked_reason ? (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-red-700">
                  Block reason: {profile.blocked_reason}
                </p>
              ) : null}
              {profile.force_reauth_after ? (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
                  Force re-auth after: {shortDate(profile.force_reauth_after)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </AdminShell>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminShell
          title="Access Control"
          subtitle="Course, bundle, product assign/revoke করুন। manual grant-ও delivery queue trigger করবে।"
        >
          <form action={grantAccessAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input type="hidden" name="user_id" value={userId} />
            <Select name="item_ref" defaultValue={accessOptions[0] ? `${accessOptions[0].itemType}:${accessOptions[0].slug}` : ''}>
              {accessOptions.map((option) => {
                return (
                  <option key={`${option.itemType}:${option.slug}`} value={`${option.itemType}:${option.slug}`}>
                    [{option.itemType}] {option.title}
                  </option>
                );
              })}
            </Select>
            <ActionButton>Grant access</ActionButton>
          </form>

          <div className="mt-5 space-y-3">
            {entitlements.map((entitlement) => (
              <div
                key={entitlement.id}
                className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{entitlement.item_title}</p>
                      <StatusBadge tone="brand">{entitlement.item_type}</StatusBadge>
                      <StatusBadge
                        tone={
                          entitlement.status === 'active'
                            ? 'success'
                            : entitlement.status === 'revoked'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {entitlement.status}
                      </StatusBadge>
                      <StatusBadge tone="neutral">
                        Delivery {entitlement.delivery_state}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {entitlement.item_slug} • source {entitlement.source}
                    </p>
                  </div>
                  {entitlement.status !== 'revoked' ? (
                    <form action={revokeAccessAction} className="flex items-center gap-2">
                      <input type="hidden" name="user_id" value={userId} />
                      <input type="hidden" name="entitlement_id" value={entitlement.id} />
                      <Input name="reason" placeholder="Reason" className="min-w-[180px]" />
                      <ActionButton tone="danger">Revoke</ActionButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}

            {entitlements.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                এই user-এর কোনো entitlement নেই।
              </div>
            ) : null}
          </div>
        </AdminShell>

        <AdminShell title="Internal Notes" subtitle="Support বা admin-only context এখানে লিখুন।">
          <form action={addUserAdminNoteAction} className="grid gap-3">
            <input type="hidden" name="user_id" value={userId} />
            <TextArea name="note" placeholder="Internal note" required />
            <ActionButton>Add note</ActionButton>
          </form>

          <div className="mt-5 space-y-3">
            {notes.map((note) => (
              <article key={note.id} className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{note.admin_email}</p>
                <p className="mt-1">{note.note}</p>
                <p className="mt-2 text-xs text-gray-500">{shortDate(note.created_at)}</p>
              </article>
            ))}
          </div>
        </AdminShell>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <AdminShell title="Orders" subtitle="Purchase history and coupon usage snapshot।">
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={order.payment_status === 'paid' ? 'success' : 'warning'}>
                    {order.payment_status}
                  </StatusBadge>
                  <StatusBadge tone="neutral">
                    {order.fulfillment_status || 'legacy'}
                  </StatusBadge>
                  {order.coupon_code ? <StatusBadge tone="brand">{order.coupon_code}</StatusBadge> : null}
                </div>
                <p className="mt-3 font-bold text-gray-900">{money(order.final_amount)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {shortDate(order.created_at)} • #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </AdminShell>

        <AdminShell title="Delivery History" subtitle="Queue, retry attempts, delivery status।">
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
              </div>
            ))}
          </div>
        </AdminShell>

        <AdminShell title="Risk & Sessions" subtitle="Suspicious activity signals and recent devices।">
          <div className="space-y-3">
            {riskEvents.map((risk) => (
              <div key={risk.id} className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-bold">
                  {risk.risk_level} risk • {risk.risk_score}
                </p>
                <p className="mt-1 text-xs">{risk.ip_address || 'No IP'} • {shortDate(risk.created_at)}</p>
                <p className="mt-2">{(risk.reasons ?? []).join(', ') || 'No reasons saved'}</p>
              </div>
            ))}

            {sessions.map((session) => (
              <div key={session.id} className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm">
                <p className="font-semibold text-gray-900">{session.ip_address || 'Unknown IP'}</p>
                <p className="mt-1 break-all">{session.user_agent || 'Unknown device'}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {(session.city || session.country_code || 'Unknown location')} • {shortDate(session.seen_at)}
                </p>
              </div>
            ))}
          </div>
        </AdminShell>
      </div>
    </div>
  );
}
