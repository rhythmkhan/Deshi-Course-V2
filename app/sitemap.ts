import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';
import { BUNDLE_CATALOG } from '@/lib/bundle-catalog';
import { COURSE_CATALOG } from '@/lib/course-catalog';
import { SITE_URL } from '@/lib/site-url';
import { SHOP_CATALOG } from '@/lib/shop-catalog';

export const revalidate = 86400;

const LAST_MODIFIED = new Date('2026-03-11T00:00:00+06:00');

export default function sitemap(): MetadataRoute.Sitemap {
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
      lastModified: LAST_MODIFIED,
      changeFrequency,
      priority,
    })),
    ...COURSE_CATALOG.map((course) => ({
      url: `${SITE_URL}/courses/${course.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...BUNDLE_CATALOG.map((bundle) => ({
      url: `${SITE_URL}/bundles/${bundle.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...SHOP_CATALOG.map((product) => ({
      url: `${SITE_URL}/templates/${product.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}
