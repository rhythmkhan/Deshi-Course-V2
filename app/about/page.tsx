import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import Image from 'next/image';
import AnimatedCounter from '@/components/AnimatedCounter';
import StructuredData from '@/components/StructuredData';
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
      <PageHeader 
        title="আমাদের সম্পর্কে" 
        subtitle="আমরা মানসম্পন্ন শিক্ষা এবং ব্যবহারিক দক্ষতার ওপর গুরুত্ব দিই যা আপনাকে বর্তমান কর্মক্ষেত্রে সফল হতে সাহায্য করবে।" 
      />
      
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/about/800/600"
                alt="About Us"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
              <p className="text-lg leading-relaxed text-gray-700">
                দেশি কোর্স একটি অনলাইন লার্নিং প্ল্যাটফর্ম যা শিক্ষার্থীদের আধুনিক বিশ্বের চাহিদাসম্পন্ন দক্ষতা অর্জনে সহায়তা করে। আমরা বিশ্বাস করি যে মানসম্পন্ন শিক্ষা সবার জন্য সহজলভ্য হওয়া উচিত।
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                আমাদের অভিজ্ঞ মেন্টররা আপনাকে হাতে-কলমে প্রজেক্টের মাধ্যমে শেখাবেন, যাতে আপনি তাত্ত্বিক জ্ঞানের পাশাপাশি ব্যবহারিক অভিজ্ঞতাও অর্জন করতে পারেন।
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="p-6 bg-purple-50 rounded-2xl">
                  <p className="mb-2 text-2xl font-bold text-brand">
                    <AnimatedCounter value={50} suffix="কে+" />
                  </p>
                  <p className="text-gray-700">সফল শিক্ষার্থী</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-2xl">
                  <p className="mb-2 text-2xl font-bold text-brand">
                    <AnimatedCounter value={100} suffix="+" />
                  </p>
                  <p className="text-gray-700">বিশেষজ্ঞ মেন্টর</p>
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
