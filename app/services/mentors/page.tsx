import type { Metadata } from 'next';
import Link from 'next/link';
import { MessagesSquare, SearchCheck, Users } from 'lucide-react';
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
  title: 'Learning Guidance ও Support | দেশি কোর্স',
  description:
    'দেশি কোর্সে mentor-style guidance, support group বা build review থাকলে কীভাবে offer detail থেকে verify করবেন।',
  path: '/services/mentors',
  keywords: ['learning guidance bangla', 'course support group', 'deshi course mentor'],
});

export const revalidate = 86400;

export default function MentorsPage() {
  const guidanceItems = [
    {
      title: 'Offer-specific guidance',
      desc: 'প্রতিটি course বা bundle-এর support/guidance availability আলাদা হতে পারে।',
      icon: <SearchCheck className="h-8 w-8" />,
    },
    {
      title: 'Support channels',
      desc: 'WhatsApp, Messenger, email এবং contact form দিয়ে question পাঠানো যায়।',
      icon: <MessagesSquare className="h-8 w-8" />,
    },
    {
      title: 'Community or review',
      desc: 'Private group, Q&A বা build review থাকলে সেটি নির্দিষ্ট offer detail-এ উল্লেখ থাকবে।',
      icon: <Users className="h-8 w-8" />,
    },
  ];

  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'Learning Guidance', path: '/services/mentors' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স Learning Guidance',
            description: 'Offer-specific support, Q&A বা guidance availability guide।',
            path: '/services/mentors',
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Guidance answer"
        title="Mentor বা support group আছে কি?"
        answer="Support group, live Q&A, build review বা mentor-style guidance courseভেদে আলাদা হতে পারে। কোনো offer-এ থাকলে detail page-এ visible থাকবে অথবা support team থেকে confirm করতে হবে।"
        points={[
          'Fake mentor claims রাখা হয়নি',
          'Offer-specific support verify করুন',
          'Course detail page আগে পড়ুন',
          'প্রশ্ন থাকলে contact করুন',
        ]}
        ctaHref="/contact"
        ctaLabel="Guidance বিষয়ে জিজ্ঞেস করুন"
      />
      <PageHeader
        title="Learning Guidance"
        subtitle="Guidance, support group বা review সুবিধা থাকলে সেটি নির্দিষ্ট offer অনুযায়ী যাচাই করুন।"
      />

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-20">
          <div className="grid gap-10 md:grid-cols-3">
            {guidanceItems.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-gray-100 bg-white p-8 text-center transition hover:shadow-2xl"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-brand">
                  {item.icon}
                </div>
                <h2 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h2>
                <p className="leading-relaxed text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/courses" className="font-bold text-brand hover:underline">
              Course detail page দেখে guidance availability verify করুন
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
