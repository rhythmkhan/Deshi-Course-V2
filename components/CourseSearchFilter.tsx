'use client';

import { useMemo, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import Link from 'next/link';
import type { CourseSummary } from '@/lib/course-catalog';

interface CourseSearchFilterProps {
  courses: CourseSummary[];
}

const LEVEL_LABELS: Record<CourseSummary['level'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advance',
};

export default function CourseSearchFilter({ courses }: CourseSearchFilterProps) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<CourseSummary['level'] | 'all'>('all');

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.category.toLowerCase().includes(normalizedQuery) ||
        course.instructor.toLowerCase().includes(normalizedQuery);

      const matchesLevel = level === 'all' || course.level === level;

      return matchesQuery && matchesLevel;
    });
  }, [courses, level, query]);

  return (
    <section className="border-b border-gray-100 bg-white/80 px-4 pb-8 pt-0 backdrop-blur sm:px-6 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-[1.4fr_0.8fr_auto] sm:items-center sm:p-5">
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

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseSummary['level'] | 'all')}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
            >
              <option value="all">সব level</option>
              <option value="beginner">{LEVEL_LABELS.beginner}</option>
              <option value="intermediate">{LEVEL_LABELS.intermediate}</option>
              <option value="advanced">{LEVEL_LABELS.advanced}</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="rounded-full bg-brand/10 px-3 py-2 text-xs font-semibold text-brand">
              {filteredCourses.length} course
            </span>
            <Link
              href="/courses"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Reset
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
