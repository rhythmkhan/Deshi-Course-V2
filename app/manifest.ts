import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/seo';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 86400;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'দেশি কোর্স',
    description:
      'বাংলায় n8n automation, vibe coding, video editing, flutter, cyber security এবং digital product শেখার practical online learning platform।',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6d28d9',
    lang: 'bn-BD',
    dir: 'ltr',
    id: SITE_URL,
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
