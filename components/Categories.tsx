import Link from 'next/link';
import {
  Briefcase,
  Code2,
  Cpu,
  Video,
} from 'lucide-react';
import { COURSE_CATALOG } from '@/lib/course-catalog';

export default function Categories() {
  const toBanglaNumber = (value: string | number) =>
    String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);

  const categories = [
    {
      icon: Cpu,
      title: 'এআই ও অটোমেশন',
      count: COURSE_CATALOG.filter((course) => course.category === 'এআই ও অটোমেশন').length,
      href: '/courses',
    },
    {
      icon: Video,
      title: 'ভিডিও এডিটিং',
      count: COURSE_CATALOG.filter((course) => course.category === 'ভিডিও এডিটিং').length,
      href: '/courses',
    },
    {
      icon: Code2,
      title: 'অ্যাপ ও প্রোগ্রামিং',
      count: COURSE_CATALOG.filter((course) => course.category === 'অ্যাপ ও প্রোগ্রামিং').length,
      href: '/courses',
    },
    {
      icon: Briefcase,
      title: 'বিজনেস ও সিকিউরিটি',
      count: COURSE_CATALOG.filter((course) => course.category === 'বিজনেস ও সিকিউরিটি').length,
      href: '/courses',
    },
  ];

  return (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">কোর্স <span className="text-brand">ক্যাটাগরি</span></h2>
          <p className="text-sm text-gray-500 sm:text-base">আপনার পছন্দের বিষয় অনুযায়ী কোর্স নির্বাচন করুন</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:gap-6">
          {categories.map((cat, index) => (
            <Link key={index} href={cat.href} className="block">
              <div className="cursor-pointer rounded-2xl border border-transparent bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand/20 hover:shadow-md sm:p-6 md:p-8">
                <div className="text-brand mb-4 flex justify-center">
                  <cat.icon size={32} strokeWidth={1.5} className="sm:h-10 sm:w-10" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 sm:text-base lg:text-lg">{cat.title}</h4>
                <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                  {toBanglaNumber(cat.count)} টি
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
