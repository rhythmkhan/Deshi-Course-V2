import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { FEATURED_COURSES, type CourseSummary } from '@/lib/course-catalog';

interface FeaturedCoursesProps {
  courses?: CourseSummary[];
  limit?: number;
  mobileLimit?: number;
  desktopLimit?: number;
}

export default function FeaturedCourses({
  courses = FEATURED_COURSES,
  limit,
  mobileLimit,
  desktopLimit,
}: FeaturedCoursesProps) {
  const formatBanglaPrice = (value: number) =>
    value === 0
      ? 'FREE'
      : `৳ ${value.toFixed(2).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])}`;

  const maxLimit = Math.max(limit ?? 0, mobileLimit ?? 0, desktopLimit ?? 0);
  const visibleCourses = maxLimit > 0 ? courses.slice(0, maxLimit) : courses;

  return (
    <section className="deferred-section py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">জনপ্রিয় <span className="text-brand">কোর্সসমূহ</span></h2>
            <p className="text-sm text-gray-600 sm:text-base">সেরা মানের কোর্সগুলো থেকে আপনার পছন্দেরটি বেছে নিন।</p>
          </div>
          <Link
            href="/courses"
            className="hidden rounded-xl bg-brand/10 px-6 py-3 text-center font-bold text-brand transition hover:bg-brand hover:text-white md:mt-0 md:inline-flex md:w-auto md:rounded-lg md:py-2"
          >
            সব দেখুন
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {visibleCourses.map((course, index) => {
            const hideOnDesktop =
              typeof mobileLimit === 'number' &&
              typeof desktopLimit === 'number' &&
              mobileLimit > desktopLimit &&
              index >= desktopLimit &&
              index < mobileLimit;

            return (
            <article 
              key={course.slug}
              className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${hideOnDesktop ? 'lg:hidden' : ''}`}
            >
              <div className="relative h-28 overflow-hidden sm:h-48">
                <Image 
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  unoptimized={course.image.startsWith('/api/catalog-art')}
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 360px"
                />
                {course.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                      {course.tag}
                    </span>
                )}
                {course.promoTag && (
                  <span
                    className="absolute right-2 top-2 inline-flex h-[58px] w-[58px] -rotate-12 items-center justify-center border-2 border-white bg-[#ef4444] px-2 text-center text-[8px] font-black uppercase leading-tight tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)] sm:right-4 sm:top-4 sm:h-[72px] sm:w-[72px] sm:text-[9px]"
                    style={{ clipPath: 'polygon(50% 0%, 60% 18%, 78% 6%, 74% 26%, 94% 22%, 82% 40%, 100% 50%, 82% 60%, 94% 78%, 74% 74%, 78% 94%, 60% 82%, 50% 100%, 40% 82%, 22% 94%, 26% 74%, 6% 78%, 18% 60%, 0% 50%, 18% 40%, 6% 22%, 26% 26%, 22% 6%, 40% 18%)' }}
                  >
                    {course.promoTag}
                  </span>
                )}
              </div>
              <div className="flex grow flex-col p-3 sm:p-6">
                <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-gray-900 sm:mb-3 sm:text-xl">{course.title}</h3>
                <div className="mb-3 text-[11px] text-gray-600 sm:mb-4 sm:text-sm">
                  <span className="line-clamp-1">{course.instructor}</span>
                </div>
                <ul className="mb-4 flex-1 space-y-1.5 text-[11px] leading-4 text-gray-700 sm:mb-6 sm:space-y-2 sm:text-sm sm:leading-5">
                  {course.featureMetrics.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="line-clamp-2">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-lg font-bold text-gray-900 sm:text-2xl">
                    {formatBanglaPrice(course.price)}
                  </span>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="w-full rounded-lg bg-brand px-3 py-2 text-center text-xs font-bold text-white sm:w-auto sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm"
                  >
                    বিস্তারিত দেখুন
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        <Link
          href="/courses"
          className="mt-5 flex w-full rounded-xl bg-brand/10 px-6 py-3 text-center font-bold text-brand transition hover:bg-brand hover:text-white md:hidden"
        >
          <span className="w-full">সব দেখুন</span>
        </Link>
      </div>
    </section>
  );
}
