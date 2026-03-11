import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Infographic from '@/components/Infographic';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import StructuredData from '@/components/StructuredData';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from '@/lib/seo';
import { BUNDLE_CATALOG } from '@/lib/bundle-catalog';

export const metadata: Metadata = buildMetadata({
  title: 'Course Bundles | n8n Bundle, Vibe Coding Bundle | দেশি কোর্স',
  description:
    'কোর্সের সাথে template, prompt library বা bonus resource একসাথে নিতে চাইলে আমাদের বাংলা bundle collection দেখুন।',
  path: '/bundles',
  keywords: [
    'course bundle bangla',
    'n8n bundle',
    'vibe coding bundle',
    'bundle offer bangladesh',
  ],
});

export const revalidate = 86400;

export default function BundlesPage() {
  const schema = buildCollectionPageSchema(
    'বান্ডেলসমূহ',
    'বাংলা course bundle collection',
    '/bundles',
    BUNDLE_CATALOG.map((bundle) => ({
      name: bundle.title,
      path: `/bundles/${bundle.slug}`,
    })),
  );

  return (
    <main className="min-h-screen bg-white">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'হোম', path: '/' },
          { name: 'বান্ডেলসমূহ', path: '/bundles' },
        ])}
      />
      <StructuredData data={schema} />
      <Navbar />
      <PageHeader
        title="বান্ডেলসমূহ"
        subtitle="কোর্সের সাথে extra library, template বা bonus add-on একসাথে নিতে চাইলে bundle গুলো দেখুন।"
      />
      <Infographic />
      <Footer />
    </main>
  );
}
