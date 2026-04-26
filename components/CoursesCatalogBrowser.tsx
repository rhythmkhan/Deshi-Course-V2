'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown, Filter, Search, X } from 'lucide-react';
import type { CourseSummary } from '@/lib/course-catalog';

interface CoursesCatalogBrowserProps {
  courses: CourseSummary[];
  title: string;
  subtitle: string;
  initialQuery?: string;
}

function getCourseClass(course: CourseSummary) {
  if (course.price === 0) return 'free';
  if (course.price === 99) return 'beginner';
  if (course.price === 299) return 'intermediate';
  if (course.price === 499) return 'advanced';
  return course.level;
}

export default function CoursesCatalogBrowser({
  courses,
  title,
  subtitle,
  initialQuery = '',
}: CoursesCatalogBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const [level, setLevel] = useState<CourseSummary['level'] | 'free' | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.category.toLowerCase().includes(normalizedQuery) ||
        course.instructor.toLowerCase().includes(normalizedQuery);

      const matchesLevel =
        level === 'all' ||
        getCourseClass(course) === level;

      return matchesQuery && matchesLevel;
    });
  }, [courses, deferredQuery, level]);

  const formatBanglaPrice = (value: number) =>
    value === 0
      ? 'FREE'
      : `৳ ${value.toFixed(2).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])}`;

  return (
    <section className="deferred-section bg-purple-50 py-14 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 px-4 py-10 text-center shadow-[0_20px_60px_rgba(91,33,182,0.08)] backdrop-blur-sm sm:px-6 sm:py-14 lg:px-8">
          <div className="relative z-10 mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-gray-700 sm:text-base lg:text-lg">
              {subtitle}
            </p>
          </div>
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-brand/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-brand/5 translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="-mt-8 mb-6 grid gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-[1.4fr_0.8fr_auto] sm:items-center sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="কোর্স, category বা instructor search করুন"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition hover:bg-white focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
              aria-haspopup="listbox"
              aria-expanded={isFilterOpen}
            >
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Filter className="h-4 w-4" />
              </span>
              <span className="font-medium">
                {level === 'all'
                  ? 'সব level'
                  : level === 'free'
                    ? 'Free'
                    : level === 'beginner'
                      ? 'Beginner'
                      : level === 'intermediate'
                        ? 'Intermediate'
                        : 'Advance'}
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                {[
                  { value: 'all', label: 'সব level' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advance' },
                  { value: 'free', label: 'Free' },
                ].map((option) => {
                  const active = level === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setLevel(option.value as CourseSummary['level'] | 'free' | 'all');
                        setIsFilterOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                        active ? 'bg-brand text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{option.label}</span>
                      {active ? <Check className="h-4 w-4" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="rounded-full bg-brand/10 px-3 py-2 text-xs font-semibold text-brand">
              {filteredCourses.length} course
            </span>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setLevel('all');
                setIsFilterOpen(false);
              }}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {filteredCourses.map((course) => (
            <article
              key={course.slug}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
                <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-gray-900 sm:mb-3 sm:text-xl">
                  {course.title}
                </h3>
                <div className="mb-3 text-[11px] text-gray-600 sm:mb-4 sm:text-sm">
                  <span className="line-clamp-1">
                    {course.instructor} •{' '}
                    {getCourseClass(course) === 'free'
                      ? 'Free'
                      : getCourseClass(course) === 'beginner'
                        ? 'Beginner'
                        : getCourseClass(course) === 'intermediate'
                          ? 'Intermediate'
                          : 'Advance'}
                  </span>
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
          ))}
        </div>
      </div>
    </section>
  );
}
