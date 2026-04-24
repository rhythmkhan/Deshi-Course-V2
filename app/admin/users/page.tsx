import Link from 'next/link';
import { createUserAction, updateUserProfileAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, StatusBadge, money, shortDate } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  wallet_balance: number | string | null;
  created_at: string;
  is_blocked?: boolean | null;
  risk_score?: number | string | null;
  admin_note_summary?: string | null;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const supabase = createAdminClient();
  let query = supabase
    .from('profiles')
    .select(
      'id, full_name, email, phone, wallet_balance, created_at, is_blocked, risk_score, admin_note_summary',
    )
    .order('created_at', { ascending: false })
    .limit(32);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data } = await query;
  const users = (data as ProfileRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminShell title="Create User" subtitle="Admin থেকে manually নতুন member account খুলুন।">
          <form action={createUserAction} className="grid gap-3">
            <Input name="full_name" placeholder="Full name" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="email" type="email" placeholder="Email address" required />
              <Input name="phone" placeholder="Phone number" />
            </div>
            <Input
              name="password"
              type="text"
              placeholder="Temporary password (optional)"
            />
            <ActionButton>Create user</ActionButton>
          </form>
        </AdminShell>

        <AdminShell title="Search Users" subtitle="Email, phone বা name দিয়ে দ্রুত খুঁজুন।">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search by name, email or phone"
            />
            <ActionButton tone="secondary">Search</ActionButton>
          </form>
          <div className="mt-5 rounded-[1.5rem] border border-gray-100 bg-gray-50/70 p-4 text-sm leading-6 text-gray-600">
            Total shown: <span className="font-bold text-gray-900">{users.length}</span>
            {q ? ` for "${q}"` : ' latest users'}
          </div>
        </AdminShell>
      </div>

      <AdminShell
        title="User Directory"
        subtitle="প্রতিটা member-এর detail page আছে। সেখান থেকে access, notes, security manage করুন।"
      >
        <div className="space-y-5">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-[1.8rem] border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {user.full_name || 'নাম নেই'}
                    </h3>
                    <StatusBadge tone={user.is_blocked ? 'danger' : 'success'}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </StatusBadge>
                    <StatusBadge tone="brand">
                      Risk {Number(user.risk_score ?? 0)}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{user.email}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Joined {shortDate(user.created_at)} • Wallet {money(user.wallet_balance)}
                    {user.phone ? ` • ${user.phone}` : ''}
                  </p>
                  {user.admin_note_summary ? (
                    <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Note: {user.admin_note_summary}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex rounded-2xl border border-brand/15 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
                  >
                    Open details
                  </Link>
                </div>
              </div>

              <form
                action={updateUserProfileAction}
                className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <input type="hidden" name="user_id" value={user.id} />
                <Input name="full_name" defaultValue={user.full_name ?? ''} placeholder="নাম" />
                <Input name="phone" defaultValue={user.phone ?? ''} placeholder="ফোন নম্বর" />
                <ActionButton>Save basics</ActionButton>
              </form>
            </article>
          ))}

          {users.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              কোনো user পাওয়া যায়নি।
            </div>
          ) : null}
        </div>
      </AdminShell>
    </div>
  );
}
