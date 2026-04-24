import { deleteTestimonialAction, upsertTestimonialAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, StatusBadge, TextArea } from '@/lib/admin-ui';
import { listManagedTestimonials } from '@/lib/content-store';

export default async function AdminContentTestimonialsPage() {
  const testimonials = await listManagedTestimonials();

  return (
    <div className="space-y-8">
      <AdminShell title="Testimonials" subtitle="Homepage testimonial cards manage করুন।">
        <form action={upsertTestimonialAction} className="grid gap-3">
          <TextArea name="quote" placeholder="Quote" required />
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="name" placeholder="Name" required />
            <Input name="role" placeholder="Role" required />
            <Input name="avatar_url" placeholder="Avatar URL" />
          </div>
          <div className="flex flex-wrap gap-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <Input name="rating" type="number" defaultValue="5" className="w-32" />
            <Input name="sort_order" type="number" defaultValue="0" className="w-32" />
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="is_published" value="true" defaultChecked />
              Published
            </label>
          </div>
          <ActionButton>Save testimonial</ActionButton>
        </form>
      </AdminShell>

      <AdminShell title="Current Testimonials" subtitle="Public testimonial inventory।">
        <div className="grid gap-4 xl:grid-cols-2">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="rounded-[1.7rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={testimonial.isPublished ? 'success' : 'warning'}>
                  {testimonial.isPublished ? 'Published' : 'Draft'}
                </StatusBadge>
                <StatusBadge tone="brand">{testimonial.rating}/5</StatusBadge>
              </div>
              <p className="mt-4 text-base font-semibold text-gray-900">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm font-bold text-gray-900">{testimonial.name}</p>
              <p className="mt-1 text-sm text-gray-500">{testimonial.role}</p>
              <form action={deleteTestimonialAction} className="mt-4">
                <input type="hidden" name="id" value={testimonial.id} />
                <ActionButton tone="danger">Delete testimonial</ActionButton>
              </form>
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
