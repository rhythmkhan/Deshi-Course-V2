import { deleteFaqAction, upsertFaqAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, Select, StatusBadge, TextArea } from '@/lib/admin-ui';
import { listManagedFaqEntries } from '@/lib/content-store';

export default async function AdminContentFaqPage() {
  const faqEntries = await listManagedFaqEntries();

  return (
    <div className="space-y-8">
      <AdminShell title="FAQ Manager" subtitle="Site-wide বা item-specific FAQ maintain করুন।">
        <form action={upsertFaqAction} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[180px_1fr]">
            <Select name="scope" defaultValue="site">
              <option value="site">Site</option>
              <option value="course">Course</option>
              <option value="bundle">Bundle</option>
              <option value="shop">Product</option>
            </Select>
            <Input name="scope_slug" placeholder="Scope slug (optional)" />
          </div>
          <Input name="question" placeholder="Question" required />
          <TextArea name="answer" placeholder="Answer" required />
          <div className="flex flex-wrap gap-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="is_published" value="true" defaultChecked />
              Published
            </label>
            <Input name="sort_order" type="number" defaultValue="0" className="w-32" />
          </div>
          <ActionButton>Save FAQ</ActionButton>
        </form>
      </AdminShell>

      <AdminShell title="Current FAQ" subtitle="বর্তমান FAQ entries list।">
        <div className="space-y-3">
          {faqEntries.map((entry) => (
            <article key={entry.id} className="rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="brand">{entry.scope}</StatusBadge>
                <StatusBadge tone={entry.isPublished ? 'success' : 'warning'}>
                  {entry.isPublished ? 'Published' : 'Draft'}
                </StatusBadge>
                {entry.scopeSlug ? <StatusBadge tone="neutral">{entry.scopeSlug}</StatusBadge> : null}
              </div>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{entry.question}</h3>
              <p className="mt-2 text-sm text-gray-600">{entry.answer}</p>
              <form action={deleteFaqAction} className="mt-4">
                <input type="hidden" name="id" value={entry.id} />
                <ActionButton tone="danger">Delete FAQ</ActionButton>
              </form>
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
