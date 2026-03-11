import type {Metadata} from 'next';
import Script from 'next/script';
import MetaPixel from '@/components/MetaPixel';
import StructuredData from '@/components/StructuredData';
import { Hind_Siliguri, Inter } from 'next/font/google';
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
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
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="font-bengali antialiased">
        <StructuredData data={buildOrganizationSchema()} />
        <StructuredData data={buildWebsiteSchema()} />
        <MetaPixel />
        <div id="boot-loader" aria-hidden="true">
          <div className="boot-loader__mark" />
          <div className="boot-loader__label">দেশি কোর্স</div>
        </div>
        <Script id="boot-loader-script" strategy="beforeInteractive">
          {`
            (() => {
              const startedAt = Date.now();
              let done = false;
              const hideLoader = () => {
                if (done) return;
                done = true;
                const loader = document.getElementById('boot-loader');
                if (!loader) return;
                const elapsed = Date.now() - startedAt;
                const finalize = () => {
                  loader.classList.add('boot-loader--done');
                  window.setTimeout(() => loader.remove(), 260);
                };
                if (elapsed < 140) {
                  window.setTimeout(finalize, 140 - elapsed);
                  return;
                }
                finalize();
              };
              document.addEventListener('readystatechange', () => {
                if (document.readyState === 'interactive' || document.readyState === 'complete') {
                  hideLoader();
                }
              });
              window.addEventListener('load', hideLoader, { once: true });
              window.addEventListener('pageshow', hideLoader, { once: true });
              window.setTimeout(hideLoader, 1800);
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
