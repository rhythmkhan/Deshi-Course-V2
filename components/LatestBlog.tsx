import Image from 'next/image';
import Link from 'next/link';
import { BLOG_POSTS, type BlogPost } from '@/lib/blog-data';
import { Calendar, ArrowRight } from 'lucide-react';

type LatestBlogProps = {
  posts?: BlogPost[];
  mobileLimit?: number;
  desktopLimit?: number;
};

export default function LatestBlog({
  posts = BLOG_POSTS,
  mobileLimit = 2,
  desktopLimit = 3,
}: LatestBlogProps) {
  const visiblePosts = posts.slice(0, Math.max(mobileLimit, desktopLimit));

  return (
    <section className="deferred-section py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="mb-10 text-center sm:mb-12 md:text-left">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">আমাদের সর্বশেষ ব্লগ</h2>
            <p className="text-sm text-gray-700 sm:text-base">
              ক্যারিয়ার গাইডলাইন, স্কিল ডেভেলপমেন্ট এবং প্রযুক্তির দুনিয়ার সর্বশেষ খবরাখবর জানতে আমাদের ব্লগ পড়ুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post, index) => (
            <article 
              key={post.id}
              className={`flex flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                index >= mobileLimit ? 'hidden lg:flex' : ''
              }`}
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

        <div className="mt-8">
          <Link
            href="/blog"
            className="group inline-flex w-full items-center justify-center rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white transition-all hover:brightness-110"
          >
            <span>সব ব্লগ দেখুন</span>
            <ArrowRight className="ml-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
