import {
  deleteAnnouncementBannerAction,
  upsertAnnouncementBannerAction,
  upsertHomepageSectionAction,
} from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, StatusBadge, TextArea } from '@/lib/admin-ui';
import { listManagedAnnouncementBanners, listManagedHomepageSections } from '@/lib/content-store';

export default async function AdminContentHomepagePage() {
  const [sections, banners] = await Promise.all([
    listManagedHomepageSections(),
    listManagedAnnouncementBanners(),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-2">
        <AdminShell title="Homepage Section" subtitle="Hero, features, support ইত্যাদি JSON body দিয়ে edit করুন।">
          <form action={upsertHomepageSectionAction} className="grid gap-3">
            <Input name="section_key" placeholder="hero / features / support" required />
            <Input name="title" placeholder="Title" />
            <Input name="subtitle" placeholder="Subtitle" />
            <TextArea name="body" placeholder='{"primaryCtaLabel":"Start"}' required />
            <div className="flex flex-wrap gap-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="is_published" value="true" defaultChecked />
                Published
              </label>
              <Input name="sort_order" type="number" defaultValue="0" className="w-32" />
            </div>
            <ActionButton>Save section</ActionButton>
          </form>
        </AdminShell>

        <AdminShell title="Announcement Banner" subtitle="Top promo banner manage করুন।">
          <form action={upsertAnnouncementBannerAction} className="grid gap-3">
            <Input name="title" placeholder="Banner title" required />
            <Input name="body" placeholder="Banner body" required />
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="cta_label" placeholder="CTA label" />
              <Input name="cta_href" placeholder="CTA href" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input name="theme" placeholder="Theme" defaultValue="brand" />
              <Input name="starts_at" placeholder="Starts at (ISO optional)" />
              <Input name="ends_at" placeholder="Ends at (ISO optional)" />
            </div>
            <div className="flex flex-wrap gap-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="is_active" value="true" defaultChecked />
                Active
              </label>
              <Input name="sort_order" type="number" defaultValue="0" className="w-32" />
            </div>
            <ActionButton>Save banner</ActionButton>
          </form>
        </AdminShell>
      </div>

      <AdminShell title="Current Homepage Content" subtitle="Sections and active/inactive banners list।">
        <div className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="brand">{section.sectionKey}</StatusBadge>
                  <StatusBadge tone={section.isPublished ? 'success' : 'warning'}>
                    {section.isPublished ? 'Published' : 'Draft'}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-lg font-bold text-gray-900">{section.title || section.sectionKey}</p>
                <p className="mt-2 text-sm text-gray-600">{section.subtitle || 'No subtitle'}</p>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
                  {JSON.stringify(section.body, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={banner.isActive ? 'success' : 'warning'}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                  <StatusBadge tone="neutral">{banner.theme}</StatusBadge>
                </div>
                <p className="mt-3 text-lg font-bold text-gray-900">{banner.title}</p>
                <p className="mt-2 text-sm text-gray-600">{banner.body}</p>
                <form action={deleteAnnouncementBannerAction} className="mt-4">
                  <input type="hidden" name="id" value={banner.id} />
                  <ActionButton tone="danger">Delete banner</ActionButton>
                </form>
              </div>
            ))}
          </div>
        </div>
      </AdminShell>
    </div>
  );
}
