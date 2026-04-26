import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import {
  buildBreadcrumbSchema,
  buildMetadata,
  buildWebPageSchema,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Certificate ও Course Completion Info | দেশি কোর্স',
  description:
    'দেশি কোর্সে certificate বা completion proof থাকলে কীভাবে course detail থেকে verify করবেন।',
  path: '/services/certification',
  keywords: ['course certificate bangla', 'deshi course certificate'],
});

export const revalidate = 86400;

export default function CertificationPage() {
  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'Certificate Info', path: '/services/certification' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স Certificate Info',
            description: 'Course certificate বা completion proof availability check guide।',
            path: '/services/certification',
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Certificate answer"
        title="সব course-এ certificate আছে কি?"
        answer="সব course-এ certificate আছে ধরে নেওয়া safe নয়। Certificate বা completion proof থাকলে সেটি নির্দিষ্ট course/bundle detail page বা support response-এ verify করতে হবে।"
        points={[
          'Course detail page আগে দেখুন',
          'Certificate mention না থাকলে support-এ জিজ্ঞেস করুন',
          'Checkout-এর আগে availability confirm করুন',
          'Completion proof courseভেদে আলাদা হতে পারে',
        ]}
        ctaHref="/courses"
        ctaLabel="Course catalog দেখুন"
      />
      <PageHeader
        title="Certificate ও Completion Info"
        subtitle="Certificate-related decision নেওয়ার আগে নির্দিষ্ট course detail ও support channel দিয়ে current availability যাচাই করুন।"
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-20">
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <p>
              দেশি কোর্সে courseভেদে access, support, certificate বা completion proof আলাদা
              হতে পারে। তাই প্রতিটি offer page-এর visible detail, FAQ এবং support note পড়ে
              সিদ্ধান্ত নেওয়া উচিত।
            </p>
            <p>
              Certificate জরুরি হলে checkout করার আগে <Link href="/contact">contact page</Link> দিয়ে
              course nameসহ current availability confirm করুন।
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
