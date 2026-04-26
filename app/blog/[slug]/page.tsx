import type { Metadata } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import { getPublishedBlogPostBySlug, listPublishedBlogPosts } from '@/lib/content-store';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildMetadata,
  parseBanglaDateToIso,
} from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 43200;
export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: 'ব্লগ পোস্ট পাওয়া যায়নি | দেশি কোর্স',
      description: 'এই ব্লগ পোস্টটি বর্তমানে পাওয়া যাচ্ছে না।',
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: post.seoTitle || `${post.title} | দেশি কোর্স ব্লগ`,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    keywords: [...post.tags, post.category, 'দেশি কোর্স ব্লগ'],
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await listPublishedBlogPosts())
    .filter(
      (item) =>
        item.slug !== post.slug &&
        (item.category === post.category ||
          item.tags.some((tag) => post.tags.includes(tag))),
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'ব্লগ', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          buildBlogPostingSchema({
            title: post.title,
            description: post.excerpt,
            path: `/blog/${post.slug}`,
            image: post.image,
            author: post.author,
            datePublished: parseBanglaDateToIso(post.date),
            keywords: post.tags,
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Article answer"
        title={post.title}
        answer={post.excerpt}
        points={[
          `Category: ${post.category}`,
          `Author/publisher: ${post.author}`,
          `Published: ${post.date}`,
        ]}
      />
      
      <main className="pb-16 pt-6 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
          {/* Back Button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center text-gray-500 hover:text-brand mb-10 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>ব্লগে ফিরে যান</span>
          </Link>

          {/* Header */}
          <header className="mb-10 sm:mb-12">
            <div className="flex items-center space-x-2 mb-6">
            <span className="bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-full">
              {post.category}
            </span>
            </div>
            <h1 className="mb-8 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-500 border-y border-gray-100 py-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{post.author}</p>
                  <p className="text-xs">লেখক</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="text-sm">{post.date}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative mb-10 h-64 overflow-hidden rounded-[2rem] shadow-2xl sm:mb-12 sm:h-80 md:h-[500px]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized={post.image.startsWith('/api/catalog-art')}
              priority
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-brand prose-a:font-semibold prose-a:no-underline hover:prose-a:underline">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex items-center flex-wrap gap-3">
              <Tag className="w-5 h-5 text-gray-400 mr-2" />
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-gray-50 text-gray-600 text-sm px-4 py-2 rounded-xl border border-gray-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <section className="mt-14 border-t border-gray-100 pt-8">
              <h2 className="mb-5 text-2xl font-bold text-gray-900">সম্পর্কিত guide</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:border-brand/20 hover:bg-white"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-brand">
                      {item.category}
                    </p>
                    <h3 className="mt-2 line-clamp-3 text-base font-bold text-gray-900">
                      {item.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Newsletter / CTA */}
          <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-brand p-6 text-center text-white sm:mt-20 sm:rounded-[3rem] sm:p-10 md:p-16">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">আমাদের সাথে যুক্ত থাকুন</h2>
              <p className="text-white/80 mb-10 max-w-xl mx-auto">
                নতুন ব্লগ পোস্ট এবং কোর্সের আপডেট সবার আগে পেতে আমাদের নিউজলেটারে সাবস্ক্রাইব করুন।
              </p>
              <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="আপনার ইমেইল এড্রেস"
                  className="flex-grow px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                />
                <button className="bg-white text-brand px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition shadow-lg">
                  সাবস্ক্রাইব
                </button>
              </form>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
