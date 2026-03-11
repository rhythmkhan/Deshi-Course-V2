import type {Metadata} from 'next';
import MetaPixel from '@/components/MetaPixel';
import StructuredData from '@/components/StructuredData';
import { Hind_Siliguri } from 'next/font/google';
import {
  buildMetadata,
  buildOrganizationSchema,
  buildWebsiteSchema,
  SITE_NAME,
} from '@/lib/seo';
import { SITE_URL } from '@/lib/site-url';
import './globals.css';

const hindSiliguri = Hind_Siliguri({
  subsets: ['latin', 'bengali'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bengali',
});

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} | বাংলা Online Course, n8n Automation, Vibe Coding, Video Editing`,
  description:
    'বাংলায় n8n automation, vibe coding, video editing, flutter app development, cyber security এবং digital product শেখার practical online learning platform।',
  path: '/',
  keywords: [
    'বাংলা online course',
    'n8n automation course bangla',
    'vibe coding bangla',
    'video editing course bangla',
    'flutter app development course bangla',
    'cyber security course bangla',
    'deshi course',
  ],
});

metadata.applicationName = SITE_NAME;
metadata.authors = [{ name: SITE_NAME, url: SITE_URL }];
metadata.creator = SITE_NAME;
metadata.publisher = SITE_NAME;
metadata.manifest = '/manifest.webmanifest';
metadata.icons = {
  icon: [{ url: '/logo.png', type: 'image/png' }],
  shortcut: ['/logo.png'],
  apple: [{ url: '/logo.png', type: 'image/png' }],
};
metadata.appleWebApp = {
  title: SITE_NAME,
  capable: true,
  statusBarStyle: 'default',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="bn" className={hindSiliguri.variable}>
      <body suppressHydrationWarning className="font-bengali antialiased">
        <StructuredData data={buildOrganizationSchema()} />
        <StructuredData data={buildWebsiteSchema()} />
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
