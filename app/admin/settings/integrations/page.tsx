import { upsertSiteSettingAction } from '@/app/admin/actions';
import { getAdminAllowlist } from '@/lib/admin-auth';
import { ActionButton, AdminShell, Input, StatusBadge } from '@/lib/admin-ui';
import { listSiteSettings } from '@/lib/content-store';
import { isSmtpConfigured } from '@/lib/email';

function isDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
      process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY,
  );
}

function isMediaConfigured() {
  return Boolean(process.env.SUPABASE_MEDIA_BUCKET);
}

export default async function AdminIntegrationsPage() {
  const settings = await listSiteSettings();
  const adminAllowlist = getAdminAllowlist();

  return (
    <div className="space-y-8">
      <AdminShell
        title="Integration Status"
        subtitle="Env-driven integrations ready কিনা এখানে দ্রুত check করুন।"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <StatusBadge tone={isSmtpConfigured() ? 'success' : 'warning'}>
              {isSmtpConfigured() ? 'Ready' : 'Missing'}
            </StatusBadge>
            <p className="mt-3 text-lg font-bold text-gray-900">SMTP Email</p>
            <p className="mt-1 text-sm text-gray-500">Order, direct-link and support email delivery</p>
          </div>
          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <StatusBadge tone={isDriveConfigured() ? 'success' : 'warning'}>
              {isDriveConfigured() ? 'Ready' : 'Missing'}
            </StatusBadge>
            <p className="mt-3 text-lg font-bold text-gray-900">Google Drive</p>
            <p className="mt-1 text-sm text-gray-500">Service account access sharing</p>
          </div>
          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <StatusBadge tone={isMediaConfigured() ? 'success' : 'warning'}>
              {isMediaConfigured() ? 'Ready' : 'Missing'}
            </StatusBadge>
            <p className="mt-3 text-lg font-bold text-gray-900">Media bucket</p>
            <p className="mt-1 text-sm text-gray-500">Processed WebP assets storage</p>
          </div>
          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <StatusBadge tone="brand">{adminAllowlist.length} admin</StatusBadge>
            <p className="mt-3 text-lg font-bold text-gray-900">Allowlist</p>
            <p className="mt-1 text-sm text-gray-500">{adminAllowlist.join(', ')}</p>
          </div>
        </div>
      </AdminShell>

      <AdminShell
        title="Site Settings"
        subtitle="Key/value JSON settings store. marketing বা small feature flags এখানে রাখতে পারেন।"
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
            <form action={upsertSiteSettingAction} className="grid gap-3">
              <Input name="setting_key" placeholder="setting key" required />
              <textarea
                name="setting_value"
                defaultValue="{}"
                className="min-h-[180px] rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
              />
              <ActionButton>Save setting</ActionButton>
            </form>
          </div>

          <div className="space-y-3">
            {settings.map((setting) => (
              <div key={setting.key} className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-brand">{setting.key}</p>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
                  {JSON.stringify(setting.value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </AdminShell>
    </div>
  );
}
