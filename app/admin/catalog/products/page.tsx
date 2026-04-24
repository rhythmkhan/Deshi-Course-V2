import { deleteProductAction, upsertDeliveryRuleAction, upsertProductAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge, TextArea } from '@/lib/admin-ui';
import { listManagedProducts } from '@/lib/content-store';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminCatalogProductsPage() {
  const supabase = createAdminClient();
  const [products, rulesResult] = await Promise.all([
    listManagedProducts(),
    supabase
      .from('delivery_rules')
      .select('id, item_slug, channel, position, is_active, config')
      .eq('item_type', 'shop')
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
      <AdminShell title="Product CMS" subtitle="Templates, digital files, direct-link products manage করুন।">
        <form action={upsertProductAction} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" placeholder="Title" required />
            <Input name="slug" placeholder="slug" required />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="type" placeholder="Type" required />
            <Input name="format" placeholder="Format" required />
            <Select name="visibility" defaultValue="public">
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="price" type="number" placeholder="Price" required />
            <Input name="access_duration_days" type="number" placeholder="Access days" />
            <Input name="access_label" placeholder="Access label" required />
          </div>
          <Input name="image" placeholder="Image URL" required />
          <Input name="description" placeholder="Short description" required />
          <Input name="feature_metrics" placeholder="Feature metrics (one per line)" />
          <Input name="short_description" placeholder="Short description 2" />
          <TextArea name="detail_content" placeholder='{"overview":"..."}' />
          <TextArea name="metadata" placeholder='{"delivery":"email"}' />
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
          <ActionButton>Save product</ActionButton>
        </form>
      </AdminShell>

      <AdminShell title="Product Delivery Rules" subtitle="Email/Drive/template delivery config per product।">
        <form action={upsertDeliveryRuleAction} className="grid gap-3 md:grid-cols-[180px_1fr_220px_120px_auto]">
          <input type="hidden" name="item_type" value="shop" />
          <Input name="item_slug" placeholder="product slug" required />
          <Select name="channel" defaultValue="email_template">
            <option value="telegram_invite">telegram_invite</option>
            <option value="google_drive_share">google_drive_share</option>
            <option value="email_template">email_template</option>
          </Select>
          <Input name="position" type="number" defaultValue="0" />
          <Input name="config" placeholder='{"subject":"Access for {{item_title}}"}' />
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

      <AdminShell title="Current Products" subtitle="Live digital product inventory।">
        <div className="grid gap-4 xl:grid-cols-2">
          {products.map((product) => (
            <article key={product.slug} className="rounded-[1.7rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={product.isPublished ? 'success' : 'warning'}>
                  {product.isPublished ? 'Published' : 'Draft'}
                </StatusBadge>
                {product.isFeatured ? <StatusBadge tone="brand">Featured</StatusBadge> : null}
              </div>
              <h3 className="mt-3 text-xl font-bold text-gray-900">{product.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.slug}</p>
              <p className="mt-2 text-sm text-gray-600">{product.type} • {product.format}</p>
              <form action={deleteProductAction} className="mt-4">
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="slug" value={product.slug} />
                <ActionButton tone="danger">Delete product</ActionButton>
              </form>
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
