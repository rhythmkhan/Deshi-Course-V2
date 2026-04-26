import type { MetadataRoute } from 'next';
import {
  listPublishedBlogPosts,
  listSeoBundles,
  listSeoCourses,
  listSeoProducts,
} from '@/lib/content-store';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, bundles, products, posts] = await Promise.all([
    listSeoCourses(),
    listSeoBundles(),
    listSeoProducts(),
    listPublishedBlogPosts(),
  ]);
  const siteLastModified = new Date();

  const staticRoutes = [
    { route: '', changeFrequency: 'daily' as const, priority: 1 },
    { route: '/about', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/blog', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/bundles', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/contact', changeFrequency: 'weekly' as const, priority: 0.7 },
    { route: '/courses', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/faq', changeFrequency: 'weekly' as const, priority: 0.7 },
    { route: '/privacy', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/refund-policy', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/services/certification', changeFrequency: 'monthly' as const, priority: 0.5 },
    { route: '/services/mentors', changeFrequency: 'monthly' as const, priority: 0.5 },
    { route: '/services/support', changeFrequency: 'monthly' as const, priority: 0.5 },
    { route: '/products', changeFrequency: 'weekly' as const, priority: 0.8 },
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
      lastModified: siteLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...bundles.map((bundle) => ({
      url: `${SITE_URL}/bundles/${bundle.slug}`,
      lastModified: siteLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: siteLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: siteLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}

