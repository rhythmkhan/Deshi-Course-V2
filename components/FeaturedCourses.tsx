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
    `৳ ${value.toFixed(2).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])}`;

  const maxLimit = Math.max(limit ?? 0, mobileLimit ?? 0, desktopLimit ?? 0);
  const visibleCourses = maxLimit > 0 ? courses.slice(0, maxLimit) : courses;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">জনপ্রিয় <span className="text-brand">কোর্সসমূহ</span></h2>
            <p className="text-sm text-gray-500 sm:text-base">সেরা মানের কোর্সগুলো থেকে আপনার পছন্দেরটি বেছে নিন।</p>
          </div>
          <Link
            href="/courses"
            className="hidden rounded-xl bg-brand/10 px-6 py-3 text-center font-bold text-brand transition hover:bg-brand hover:text-white md:mt-0 md:inline-flex md:w-auto md:rounded-lg md:py-2"
          >
            সব দেখুন
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 md:gap-8">
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
              className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${hideOnDesktop ? 'md:hidden' : ''}`}
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
              </div>
              <div className="flex grow flex-col p-3 sm:p-6">
                <h4 className="mb-2 line-clamp-2 text-sm font-bold leading-snug sm:mb-3 sm:text-xl">{course.title}</h4>
                <div className="mb-3 text-[11px] text-gray-500 sm:mb-4 sm:text-sm">
                  <span className="line-clamp-1">{course.instructor}</span>
                </div>
                <ul className="mb-4 space-y-1.5 text-[11px] leading-4 text-gray-600 sm:mb-6 sm:space-y-2 sm:text-sm sm:leading-5">
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
