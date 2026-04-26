import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import FaqAccordion from '@/components/FaqAccordion';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import { listPublishedFaqEntries } from '@/lib/content-store';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildMetadata,
  buildWebPageSchema,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'FAQ | Course Access, Payment ও Support | দেশি কোর্স',
  description:
    'দেশি কোর্সের course access, payment, certificate, refund এবং support সংক্রান্ত common question-এর উত্তর।',
  path: '/faq',
  keywords: ['deshi course faq', 'course access help', 'payment support bangla'],
});

export const revalidate = 86400;

export default async function FaqPage() {
  const faqItems = (await listPublishedFaqEntries('site')).map((entry) => ({
    question: entry.question,
    answer: entry.answer,
  }));

  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স FAQ',
            description:
              'Course access, payment, certificate এবং support FAQ collection।',
            path: '/faq',
            type: 'FAQPage',
          }),
          ...(faqItems.length > 0 ? [buildFaqSchema(faqItems)] : []),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="FAQ answer"
        title="কোর্স access বা payment issue হলে কী করবেন?"
        answer="প্রথমে এই FAQ থেকে common answer দেখুন। তারপরও issue থাকলে contact page দিয়ে account email, order reference এবং কোন item নিয়ে সমস্যা হচ্ছে তা পাঠান।"
        points={[
          'Course access ও payment status',
          'Certificate এবং support policy',
          'Refund policy link',
          'Direct contact next step',
        ]}
        ctaHref="/contact"
        ctaLabel="Support-এ যোগাযোগ করুন"
      />
      <PageHeader
        title="সচরাচর জিজ্ঞাসিত প্রশ্নাবলী"
        subtitle="কোর্স কেনা, payment, access, certificate এবং support সংক্রান্ত সাধারণ প্রশ্নের বিস্তারিত উত্তর এখানে পাবেন।"
      />

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-20">
          <div className="rounded-[2rem] bg-gray-50 p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <HelpCircle className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">প্রয়োজনীয় সহায়তা দ্রুত খুঁজে নিন</h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-600 sm:text-base">
              সবচেয়ে common প্রশ্নগুলোর উত্তর আমরা পরিষ্কারভাবে এক জায়গায় সাজিয়েছি, যাতে enrollment থেকে certificate পর্যন্ত সবকিছু দ্রুত বুঝতে পারেন।
            </p>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="rounded-2xl bg-white p-4">কোর্স access, payment status এবং certificate policy সম্পর্কে বিস্তারিত তথ্য</p>
              <p className="rounded-2xl bg-white p-4">beginner learners-এর জন্য clear direction ও course suitability guidance</p>
              <p className="rounded-2xl bg-white p-4">প্রয়োজনে contact/support path-এ যাওয়ার direct next step</p>
            </div>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center font-bold text-brand transition hover:underline"
            >
              আরও সহায়তা লাগলে যোগাযোগ করুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <FaqAccordion items={faqItems} icon="arrow" numbered />
        </div>
      </section>

      <Footer />
    </main>
  );
}
