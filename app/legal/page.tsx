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
  title: 'Legal Notice | Copyright ও Acceptable Use | দেশি কোর্স',
  description:
    'দেশি কোর্সের copyright concern, acceptable use এবং legal contact information।',
  path: '/legal',
  keywords: ['deshi course legal', 'copyright notice', 'acceptable use'],
});

export const revalidate = 86400;

export default function LegalPage() {
  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'Legal', path: '/legal' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স Legal Notice',
            description: 'Copyright concern এবং acceptable use information।',
            path: '/legal',
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Legal answer"
        title="Copyright বা policy concern থাকলে কী করবেন?"
        answer="কোনো content, course/resource listing বা policy issue নিয়ে concern থাকলে relevant URL, ownership/context এবং contact informationসহ support channel দিয়ে জানান।"
        points={[
          'Specific URL বা item name দিন',
          'Concern-এর brief explanation দিন',
          'Ownership/context থাকলে যুক্ত করুন',
          'Contact page দিয়ে message পাঠান',
        ]}
        ctaHref="/contact"
        ctaLabel="Legal concern পাঠান"
      />
      <PageHeader 
        title="আইনি পদক্ষেপ" 
        subtitle="আমাদের আইনি নীতিমালা এবং কমপ্লায়েন্স সংক্রান্ত তথ্য।" 
      />
      
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-20 prose prose-lg prose-purple">
          <h2 className="text-2xl font-bold mb-6">কপিরাইট লঙ্ঘন</h2>
          <p className="text-gray-600 mb-8">
            যদি আপনি মনে করেন যে আমাদের প্ল্যাটফর্মের কোনো content, listing বা resource আপনার copyright concern তৈরি করছে, তাহলে relevant URL, item name এবং concern-এর contextসহ <Link href="/contact">contact page</Link> দিয়ে যোগাযোগ করুন।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">ব্যবহারকারীর আচরণ</h2>
          <p className="text-gray-600 mb-8">
            Platform ব্যবহার করার সময় account abuse, spam, unauthorized sharing, payment misuse বা অন্যের access/resource অননুমোদিতভাবে বিতরণ করা নিষিদ্ধ।
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
