import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import Image from 'next/image';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildMetadata,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'দেশি কোর্স সম্পর্কে | বাংলা Skill Learning Platform',
  description:
    'দেশি কোর্স একটি বাংলা skill learning platform যেখানে practical online course, digital product এবং support-driven learning experience পাওয়া যায়।',
  path: '/about',
  keywords: ['deshi course', 'about deshi course', 'বাংলা learning platform'],
});

export const revalidate = 86400;

export default function AboutPage() {
  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'আমাদের সম্পর্কে', path: '/about' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'দেশি কোর্স সম্পর্কে',
            url: absoluteUrl('/about'),
            description:
              'দেশি কোর্স একটি বাংলা skill learning platform যেখানে practical online course, digital product এবং support-driven learning experience পাওয়া যায়।',
          },
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="About answer"
        title="দেশি কোর্স কী নিয়ে কাজ করে?"
        answer="দেশি কোর্স বাংলা ভাষাভাষী learner-দের জন্য online course, digital resource, bundle এবং support channel এক জায়গায় আনার চেষ্টা করে। Site-এর catalog, price, access label এবং policy page দেখে current offer যাচাই করা যায়।"
        points={[
          'Bangla-first learning experience',
          'Course, bundle ও template catalog',
          'WhatsApp, Messenger ও email support',
          'Policy pages publicly linked',
        ]}
        ctaHref="/contact"
        ctaLabel="যোগাযোগ করুন"
      />
      <PageHeader 
        title="আমাদের সম্পর্কে" 
        subtitle="আমরা practical learning, clear access information এবং support-driven online education experience-কে গুরুত্ব দিই।" 
      />
      
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/hero.webp"
                alt="দেশি কোর্স online learning platform"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 92vw, 48vw"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
              <p className="text-lg leading-relaxed text-gray-700">
                দেশি কোর্স একটি অনলাইন লার্নিং এবং digital resource platform, যেখানে learner course, template, bundle, support এবং policy information এক জায়গায় দেখতে পারে।
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                আমাদের লক্ষ্য হলো offer page-গুলোতে real catalog data, clear access label, FAQ এবং support path রাখা, যাতে checkout করার আগে learner informed decision নিতে পারে।
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="p-6 bg-purple-50 rounded-2xl">
                  <p className="mb-2 text-2xl font-bold text-brand">Catalog</p>
                  <p className="text-gray-700">Course, bundle ও template একসাথে</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-2xl">
                  <p className="mb-2 text-2xl font-bold text-brand">Support</p>
                  <p className="text-gray-700">WhatsApp, Messenger ও email channel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
