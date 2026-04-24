import { deleteBlogPostAction, upsertBlogPostAction } from '@/app/admin/actions';
import { ActionButton, AdminShell, Input, StatusBadge, TextArea, shortDate } from '@/lib/admin-ui';
import { listManagedBlogPosts } from '@/lib/content-store';

export default async function AdminContentBlogPage() {
  const posts = await listManagedBlogPosts();

  return (
    <div className="space-y-8">
      <AdminShell title="Blog CMS" subtitle="Blog post create, edit, publish/unpublish এখান থেকে।">
        <form action={upsertBlogPostAction} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" placeholder="Title" required />
            <Input name="slug" placeholder="slug" required />
          </div>
          <Input name="excerpt" placeholder="Excerpt" required />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="author" placeholder="Author" required />
            <Input name="display_date" placeholder="Display date" required />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="category" placeholder="Category" required />
            <Input name="tags" placeholder="tag-one, tag-two" />
          </div>
          <Input name="image" placeholder="Cover image URL" />
          <TextArea name="content" placeholder="Sanitized HTML content" required />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="seo_title" placeholder="SEO title" />
            <Input name="seo_description" placeholder="SEO description" />
          </div>
          <TextArea name="metadata" placeholder='{"source":"admin"}' />
          <div className="flex flex-wrap gap-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="is_published" value="true" />
              Published
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="is_featured" value="true" />
              Featured
            </label>
          </div>
          <ActionButton>Save post</ActionButton>
        </form>
      </AdminShell>

      <AdminShell title="Existing Posts" subtitle="Current blog inventory।">
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-[1.8rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={post.isPublished ? 'success' : 'warning'}>
                  {post.isPublished ? 'Published' : 'Draft'}
                </StatusBadge>
                {post.isFeatured ? <StatusBadge tone="brand">Featured</StatusBadge> : null}
              </div>
              <h3 className="mt-3 text-xl font-bold text-gray-900">{post.title}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {post.slug} • {shortDate(post.publishedAt || post.createdAt)}
              </p>
              <p className="mt-3 text-sm text-gray-600">{post.excerpt}</p>
              <form action={deleteBlogPostAction} className="mt-4">
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="slug" value={post.slug} />
                <ActionButton tone="danger">Delete post</ActionButton>
              </form>
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
