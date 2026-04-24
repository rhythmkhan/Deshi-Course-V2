import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/auth/',
          '/dashboard',
          '/cart',
          '/signin',
          '/signup',
          '/forgot-password',
          '/update-password',
          '/payments/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
