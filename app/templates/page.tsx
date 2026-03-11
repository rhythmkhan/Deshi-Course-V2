import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import ProductShowcase from '@/components/ProductShowcase';
import StructuredData from '@/components/StructuredData';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from '@/lib/seo';
import { SHOP_CATALOG } from '@/lib/shop-catalog';

export const metadata: Metadata = buildMetadata({
  title: 'প্রোডাক্ট ও Templates | n8n Templates, Prompt Library, Digital Resource | দেশি কোর্স',
  description:
    'n8n templates, prompt library, WordPress templates, reels bundle ও আরো অনেক instant digital product এবং template বাংলায় access করুন।',
  path: '/templates',
  keywords: [
    'n8n templates',
    'prompt library',
    'digital product bangla',
    'wordpress templates bangla',
    'template bundle bangladesh',
  ],
});

export const revalidate = 86400;

export default function TemplatesPage() {
  const schema = buildCollectionPageSchema(
    'প্রোডাক্টসমূহ',
    'বাংলা digital product এবং template collection',
    '/templates',
    SHOP_CATALOG.map((product) => ({
      name: product.title,
      path: `/templates/${product.slug}`,
    })),
  );

  return (
    <main className="min-h-screen bg-white">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'হোম', path: '/' },
          { name: 'প্রোডাক্টসমূহ', path: '/templates' },
        ])}
      />
      <StructuredData data={schema} />
      <Navbar />
      <PageHeader
        title="প্রোডাক্টসমূহ"
        subtitle="Ready-made resource, digital pack আর instant access product collection এখানেই দেখুন।"
      />
      <ProductShowcase />
      <Footer />
    </main>
  );
}
