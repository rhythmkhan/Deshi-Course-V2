import type { Metadata } from 'next';
import React from 'react';
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
  title: 'Terms ও Refund Conditions | দেশি কোর্স',
  description:
    'দেশি কোর্সের account, payment, access, delivery, intellectual property এবং refund conditions সম্পর্কে শর্তাবলী।',
  path: '/terms',
  keywords: ['deshi course terms', 'refund conditions', 'course access terms'],
});

export const revalidate = 86400;

export default function TermsPage() {
  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'শর্তাবলী', path: '/terms' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স শর্তাবলী',
            description:
              'Account, payment, access, delivery এবং refund condition information।',
            path: '/terms',
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Terms answer"
        title="Checkout করার আগে কী জানা জরুরি?"
        answer="Account তৈরি, payment, access delivery এবং refund condition বোঝা জরুরি। Digital access/link/resource/group entry delivery হয়ে গেলে refund সাধারণত প্রযোজ্য নয়।"
        points={[
          'Valid account information দরকার',
          'Payment complete হওয়ার পর delivery/access process শুরু হয়',
          'Refund condition আলাদা page-এ বিস্তারিত আছে',
          'Content redistribution অনুমতি ছাড়া নিষিদ্ধ',
        ]}
        ctaHref="/refund-policy"
        ctaLabel="Refund policy পড়ুন"
      />
      <PageHeader 
        title="শর্তাবলী" 
        subtitle="আমাদের পরিষেবা ব্যবহারের আগে অনুগ্রহ করে শর্তাবলী পড়ে নিন।" 
      />
      
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-20 prose prose-lg prose-purple">
          <h2 className="text-2xl font-bold mb-6">১. অ্যাকাউন্ট নিবন্ধন</h2>
          <p className="text-gray-600 mb-8">
            আমাদের কোর্সগুলিতে অ্যাক্সেস পেতে আপনাকে একটি বৈধ অ্যাকাউন্ট তৈরি করতে হবে। আপনার অ্যাকাউন্টের তথ্যের গোপনীয়তা রক্ষার দায়িত্ব আপনার।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">২. পেমেন্ট ও রিফান্ড</h2>
          <p className="text-gray-600 mb-8">
            কোর্সের ফি অগ্রিম প্রদান করতে হবে। payment complete হওয়ার পর যদি এখনো course access, delivery link, group access বা download/resource handover না করা হয়ে থাকে, তাহলে যাচাই সাপেক্ষে refund সম্ভব। তবে একবার course deliver হয়ে গেলে, access/link/resource/share/group entry দেওয়া হলে বা course account-এ unlock হয়ে গেলে কোনো অবস্থাতেই refund প্রযোজ্য হবে না।
          </p>
          <p className="text-gray-600 mb-8">
            বিস্তারিত refund condition জানতে <Link href="/refund-policy" className="font-semibold text-brand hover:underline">refund policy</Link> পড়ুন।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">৩. মেধা সম্পদ</h2>
          <p className="text-gray-600 mb-8">
            প্ল্যাটফর্মের সমস্ত কন্টেন্ট, ভিডিও এবং ম্যাটেরিয়াল দেশি কোর্সের মেধা সম্পদ। এগুলো অনুমতি ছাড়া বিতরণ বা বাণিজ্যিক উদ্দেশ্যে ব্যবহার করা নিষিদ্ধ।
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
