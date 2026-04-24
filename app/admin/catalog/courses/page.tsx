import { deleteCourseAction, upsertCourseAction, upsertDeliveryRuleAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge, TextArea } from '@/lib/admin-ui';
import { listManagedCourses } from '@/lib/content-store';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminCatalogCoursesPage() {
  const supabase = createAdminClient();
  const [courses, rulesResult] = await Promise.all([
    listManagedCourses(),
    supabase
      .from('delivery_rules')
      .select('id, item_slug, channel, position, is_active, config')
      .eq('item_type', 'course')
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
      <AdminShell title="Course CMS" subtitle="Course create/update/publish আর delivery rule manage করুন।">
        <form action={upsertCourseAction} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" placeholder="Title" required />
            <Input name="slug" placeholder="slug" required />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="category" placeholder="Category" required />
            <Select name="level" defaultValue="beginner">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Select name="visibility" defaultValue="public">
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="price" type="number" placeholder="Price" required />
            <Input name="original_price" type="number" placeholder="Compare price" />
            <Input name="access_duration_days" type="number" placeholder="Access days" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="image" placeholder="Image URL" required />
            <Input name="gallery" placeholder="Gallery URLs (one per line)" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="instructor" placeholder="Instructor" required />
            <Input name="access_label" placeholder="Access label" required />
          </div>
          <Input name="feature_metrics" placeholder="Feature metrics (one per line)" />
          <Input name="tag" placeholder="Tag" />
          <Input name="promo_tag" placeholder="Promo tag" />
          <Input name="badge_label" placeholder="Badge label" />
          <Input name="support_text" placeholder="Support text" />
          <Input name="short_description" placeholder="Short description" />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="seo_title" placeholder="SEO title" />
            <Input name="seo_description" placeholder="SEO description" />
          </div>
          <TextArea name="detail_content" placeholder='{"overview":"...","modules":[]}' />
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
          <ActionButton>Save course</ActionButton>
        </form>
      </AdminShell>

      <AdminShell title="Course Delivery Rules" subtitle="Telegram, Drive, email delivery per course item।">
        <form action={upsertDeliveryRuleAction} className="grid gap-3 md:grid-cols-[180px_1fr_220px_120px_auto]">
          <input type="hidden" name="item_type" value="course" />
          <Input name="item_slug" placeholder="course slug" required />
          <Select name="channel" defaultValue="telegram_invite">
            <option value="telegram_invite">telegram_invite</option>
            <option value="google_drive_share">google_drive_share</option>
            <option value="email_template">email_template</option>
          </Select>
          <Input name="position" type="number" defaultValue="0" />
          <Input name="config" placeholder='{"track":"n8n","resource":"course"}' />
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

      <AdminShell title="Current Courses" subtitle="Live DB-backed course inventory।">
        <div className="grid gap-4 xl:grid-cols-2">
          {courses.map((course) => (
            <article key={course.slug} className="rounded-[1.7rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={course.isPublished ? 'success' : 'warning'}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </StatusBadge>
                {course.isFeatured ? <StatusBadge tone="brand">Featured</StatusBadge> : null}
                <StatusBadge tone="neutral">{course.visibility}</StatusBadge>
              </div>
              <h3 className="mt-3 text-xl font-bold text-gray-900">{course.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{course.slug}</p>
              <p className="mt-2 text-sm text-gray-600">{course.shortDescription || course.category}</p>
              <form action={deleteCourseAction} className="mt-4">
                <input type="hidden" name="id" value={course.id} />
                <input type="hidden" name="slug" value={course.slug} />
                <ActionButton tone="danger">Delete course</ActionButton>
              </form>
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
