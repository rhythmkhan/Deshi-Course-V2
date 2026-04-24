import { deleteBundleAction, upsertBundleAction, upsertDeliveryRuleAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge, TextArea } from '@/lib/admin-ui';
import { listManagedBundles } from '@/lib/content-store';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminCatalogBundlesPage() {
  const supabase = createAdminClient();
  const [bundles, rulesResult] = await Promise.all([
    listManagedBundles(),
    supabase
      .from('delivery_rules')
      .select('id, item_slug, channel, position, is_active, config')
      .eq('item_type', 'bundle')
      .order('position', { ascending: true }),
  ]);

  const rules =
    (rulesResult.data as Array<{
      id: string;
      item_slug: string;
      channel: string;
      position: number;
      is_active: boolean;
      config: Record<string, unknown> | null;
    }> | null) ?? [];

  return (
    <div className="space-y-8">
      <AdminShell title="Bundle CMS" subtitle="Bundle pricing, included courses, visibility এবং delivery rules।">
        <form action={upsertBundleAction} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" placeholder="Title" required />
            <Input name="slug" placeholder="slug" required />
          </div>
          <Input name="subtitle" placeholder="Subtitle" required />
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="bundle_price" type="number" placeholder="Bundle price" required />
            <Input name="original_price" type="number" placeholder="Compare price" />
            <Select name="visibility" defaultValue="public">
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <Input name="image" placeholder="Image URL" required />
          <Input name="access_label" placeholder="Access label" required />
          <Input name="highlight" placeholder="Highlight" required />
          <Input name="included_course_slugs" placeholder="course-one, course-two" required />
          <Input name="feature_metrics" placeholder="Feature metrics (one per line)" />
          <Input name="short_description" placeholder="Short description" />
          <TextArea name="detail_content" placeholder='{"overview":"..."}' />
          <TextArea name="metadata" placeholder='{"theme":"brand"}' />
          <div className="flex flex-wrap gap-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="is_published" value="true" defaultChecked />
              Published
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="is_featured" value="true" />
              Featured
            </label>
            <Input name="sort_order" type="number" defaultValue="0" className="w-32" />
          </div>
          <ActionButton>Save bundle</ActionButton>
        </form>
      </AdminShell>

      <AdminShell title="Bundle Delivery Rules" subtitle="Bundle-level Telegram/Drive/email config।">
        <form action={upsertDeliveryRuleAction} className="grid gap-3 md:grid-cols-[180px_1fr_220px_120px_auto]">
          <input type="hidden" name="item_type" value="bundle" />
          <Input name="item_slug" placeholder="bundle slug" required />
          <Select name="channel" defaultValue="telegram_invite">
            <option value="telegram_invite">telegram_invite</option>
            <option value="google_drive_share">google_drive_share</option>
            <option value="email_template">email_template</option>
          </Select>
          <Input name="position" type="number" defaultValue="0" />
          <Input name="config" placeholder='{"track":"n8n","resource":"template"}' />
          <ActionButton tone="secondary">Save rule</ActionButton>
        </form>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="brand">{rule.channel}</StatusBadge>
                <StatusBadge tone={rule.is_active ? 'success' : 'warning'}>
                  {rule.is_active ? 'Active' : 'Off'}
                </StatusBadge>
              </div>
              <p className="mt-3 font-bold text-gray-900">{rule.item_slug}</p>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
                {JSON.stringify(rule.config, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </AdminShell>

      <AdminShell title="Current Bundles" subtitle="Live bundle inventory।">
        <div className="grid gap-4 xl:grid-cols-2">
          {bundles.map((bundle) => (
            <article key={bundle.slug} className="rounded-[1.7rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={bundle.isPublished ? 'success' : 'warning'}>
                  {bundle.isPublished ? 'Published' : 'Draft'}
                </StatusBadge>
                {bundle.isFeatured ? <StatusBadge tone="brand">Featured</StatusBadge> : null}
              </div>
              <h3 className="mt-3 text-xl font-bold text-gray-900">{bundle.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{bundle.slug}</p>
              <p className="mt-2 text-sm text-gray-600">
                Includes {bundle.includedCourseSlugs.length} courses
              </p>
              <form action={deleteBundleAction} className="mt-4">
                <input type="hidden" name="id" value={bundle.id} />
                <input type="hidden" name="slug" value={bundle.slug} />
                <ActionButton tone="danger">Delete bundle</ActionButton>
              </form>
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
