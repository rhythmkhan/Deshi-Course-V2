import type { Metadata } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { listPublishedBlogPosts } from '@/lib/content-store';
import { Calendar, User, ArrowRight } from 'lucide-react';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'বাংলা Skill Blog, AI Guides ও Course Tips | দেশি কোর্স ব্লগ',
  description:
    'n8n automation, vibe coding, video editing, digital product, AI workflow এবং online earning নিয়ে বাংলা ব্লগ, guide ও practical tip পড়ুন।',
  path: '/blog',
  keywords: [
    'বাংলা skill blog',
    'n8n blog bangla',
    'vibe coding blog',
    'video editing tips bangla',
    'ai workflow guide bangla',
  ],
});

export const revalidate = 43200;

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();
  const schema = buildCollectionPageSchema(
    'দেশি কোর্স ব্লগ',
    'বাংলা skill blog, AI guide এবং course tips collection',
    '/blog',
    posts.map((post) => ({
      name: post.title,
      path: `/blog/${post.slug}`,
    })),
  );

  return (
    <div className="min-h-screen bg-white">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'হোম', path: '/' },
          { name: 'ব্লগ', path: '/blog' },
        ])}
      />
      <StructuredData data={schema} />
      <Navbar />
      <AnswerBlock
        eyebrow="Blog answer"
        title="দেশি কোর্স ব্লগে কী পাবেন?"
        answer="এখানে course, bundle, template, category এবং support topic নিয়ে guide পাওয়া যায়। CMS post থাকলে সেটিই দেখানো হয়; না থাকলে real catalog data থেকে generated guide তৈরি হয়।"
        points={[
          `${posts.length} published guide/post`,
          'Course ও product detail page-এ internal links',
          'FAQ-style answer sections',
          'Bangla/English practical tone',
        ]}
      />
      
      <main className="pt-10 pb-20 sm:pt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">আমাদের ব্লগ</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              নতুন স্কিল শিখুন, ক্যারিয়ার গাইডলাইন পান এবং প্রযুক্তির সর্বশেষ আপডেট সম্পর্কে জানুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <article key={post.id} className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <Link href={`/blog/${post.slug}`} className="relative h-64 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={post.image.startsWith('/api/catalog-art')}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                  <span className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {post.category}
                  </span>
                  </div>
                </Link>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1.5" />
                      {post.author}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-brand transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-brand font-bold hover:space-x-2 transition-all"
                    >
                      <span>আরও পড়ুন</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
