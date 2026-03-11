import Image from 'next/image';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-data';
import { Calendar, ArrowRight } from 'lucide-react';

export default function LatestBlog() {
  const latestPosts = BLOG_POSTS.slice(0, 2);

  return (
    <section className="deferred-section bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="mb-10 flex flex-col gap-4 text-center sm:mb-12 md:flex-row md:items-end md:justify-between md:text-left">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">আমাদের সর্বশেষ ব্লগ</h2>
            <p className="text-sm text-gray-700 sm:text-base">
              ক্যারিয়ার গাইডলাইন, স্কিল ডেভেলপমেন্ট এবং প্রযুক্তির দুনিয়ার সর্বশেষ খবরাখবর জানতে আমাদের ব্লগ পড়ুন।
            </p>
          </div>
          <Link 
            href="/blog" 
            className="inline-flex items-center justify-center text-brand font-bold transition-all group hover:space-x-2 md:justify-start"
          >
            <span>সব ব্লগ দেখুন</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post, index) => (
            <article 
              key={post.id}
              className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <Link href={`/blog/${post.slug}`} className="relative h-56 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  unoptimized={post.image.startsWith('/api/catalog-art')}
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              </Link>
              
              <div className="flex flex-grow flex-col p-5 sm:p-8">
                <div className="mb-4 flex items-center text-xs text-gray-600">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {post.date}
                  <span className="mx-2">•</span>
                    <span className="text-brand font-bold">{post.category}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 hover:text-brand transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <p className="mb-6 text-sm text-gray-700 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-sm font-bold text-brand hover:underline"
                  >
                    আরও পড়ুন
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
