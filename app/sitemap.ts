import type { MetadataRoute } from 'next';
import {
  listManagedBlogPosts,
  listManagedBundles,
  listManagedCourses,
  listManagedProducts,
} from '@/lib/content-store';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 86400;

function parseTimestamp(value?: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allCourses, allBundles, allProducts, allPosts] = await Promise.all([
    listManagedCourses(),
    listManagedBundles(),
    listManagedProducts(),
    listManagedBlogPosts(),
  ]);
  const courses = allCourses.filter((course) => course.isPublished);
  const bundles = allBundles.filter((bundle) => bundle.isPublished);
  const products = allProducts.filter((product) => product.isPublished);
  const posts = allPosts.filter((post) => post.isPublished);
  const latestContentTimestamp = Math.max(
    Date.now(),
    ...courses.map((course) => parseTimestamp(course.updatedAt) ?? 0),
    ...bundles.map((bundle) => parseTimestamp(bundle.updatedAt) ?? 0),
    ...products.map((product) => parseTimestamp(product.updatedAt) ?? 0),
    ...posts.map((post) => parseTimestamp(post.updatedAt || post.publishedAt) ?? 0),
  );
  const siteLastModified = new Date(latestContentTimestamp);

  const staticRoutes = [
    { route: '', changeFrequency: 'daily' as const, priority: 1 },
    { route: '/about', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/blog', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/bundles', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/contact', changeFrequency: 'weekly' as const, priority: 0.7 },
    { route: '/courses', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/faq', changeFrequency: 'weekly' as const, priority: 0.7 },
    { route: '/privacy', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/templates', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/terms', changeFrequency: 'monthly' as const, priority: 0.4 },
  ];

  return [
    ...staticRoutes.map(({ route, changeFrequency, priority }) => ({
      url: `${SITE_URL}${route || '/'}`,
      lastModified: siteLastModified,
      changeFrequency,
      priority,
    })),
    ...courses.map((course) => ({
      url: `${SITE_URL}/courses/${course.slug}`,
      lastModified: course.updatedAt || siteLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...bundles.map((bundle) => ({
      url: `${SITE_URL}/bundles/${bundle.slug}`,
      lastModified: bundle.updatedAt || siteLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/templates/${product.slug}`,
      lastModified: product.updatedAt || siteLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || siteLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}
