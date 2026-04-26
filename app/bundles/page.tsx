import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Infographic from '@/components/Infographic';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from '@/lib/seo';
import { listPublishedBundles, listSeoBundles } from '@/lib/content-store';

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

export default async function BundlesPage() {
  const [bundles, seoBundles] = await Promise.all([
    listPublishedBundles(),
    listSeoBundles(),
  ]);
  const schema = buildCollectionPageSchema(
    'বান্ডেলসমূহ',
    'বাংলা course bundle collection',
    '/bundles',
    seoBundles.map((bundle) => ({
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
      <AnswerBlock
        eyebrow="Bundle answer"
        title="কখন course bundle নেওয়া ভালো?"
        answer="একই skill-stack-এর course, template বা extra resource একসাথে দরকার হলে bundle useful। প্রতিটি bundle detail page থেকে included item, access label, price এবং support note মিলিয়ে সিদ্ধান্ত নেওয়া উচিত।"
        points={[
          'Included course/resource আগে দেখুন',
          'Bundle price ও original price compare করুন',
          'Access label ও support note verify করুন',
          'Single course দরকার হলে course page বেছে নিন',
        ]}
      />
      <PageHeader
        title="বান্ডেলসমূহ"
        subtitle="কোর্সের সাথে extra library, template বা bonus add-on একসাথে নিতে চাইলে bundle গুলো দেখুন।"
      />
      <Infographic bundles={bundles} />
      <Footer />
    </main>
  );
}
