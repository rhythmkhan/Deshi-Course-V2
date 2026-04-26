import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import ProductShowcase from '@/components/ProductShowcase';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from '@/lib/seo';
import {
  listPublishedProducts,
  listSeoProducts,
} from '@/lib/content-store';

export const metadata: Metadata = buildMetadata({
  title: 'প্রোডাক্ট ও Templates | n8n Templates, Prompt Library, Digital Resource | দেশি কোর্স',
  description:
    'n8n templates, prompt library, WordPress templates, reels bundle ও আরো অনেক instant digital product এবং template বাংলায় access করুন।',
  path: '/products',
  keywords: [
    'n8n templates',
    'prompt library',
    'digital product bangla',
    'wordpress templates bangla',
    'template bundle bangladesh',
  ],
});

export const revalidate = 86400;

export default async function ProductsPage() {
  const [products, seoProducts] = await Promise.all([
    listPublishedProducts(),
    listSeoProducts(),
  ]);
  const schema = buildCollectionPageSchema(
    'প্রোডাক্টসমূহ',
    'বাংলা digital product এবং template collection',
    '/products',
    seoProducts.map((product) => ({
      name: product.title,
      path: `/products/${product.slug}`,
    })),
  );

  return (
    <main className="min-h-screen bg-white">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'হোম', path: '/' },
          { name: 'প্রোডাক্টসমূহ', path: '/products' },
        ])}
      />
      <StructuredData data={schema} />
      <Navbar />
      <AnswerBlock
        eyebrow="Product answer"
        title="কোন digital product বা template বেছে নেবেন?"
        answer="প্রথমে resource type, delivery format, price এবং নিজের use-case মিলিয়ে shortlist করুন। দেশি কোর্স product catalog-এ real product title, feature list, format এবং access label দেখেই compare করা যায়।"
        points={[
          'Template/resource type দিয়ে filter করুন',
          'Digital বনাম WhatsApp delivery format দেখুন',
          'Detail page-এর FAQ ও support note পড়ুন',
          'Canonical product URL সবসময় /products path',
        ]}
      />
      <PageHeader
        title="প্রোডাক্টসমূহ"
        subtitle="Ready-made resource, digital pack আর instant access product collection এখানেই দেখুন।"
      />
      <ProductShowcase items={products} />
      <Footer />
    </main>
  );
}
