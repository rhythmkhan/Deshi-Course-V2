import Link from 'next/link';
import {
  BadgePercent,
  CircleDashed,
  Layers3,
  Rocket,
} from 'lucide-react';

export default function Categories() {
  const categories = [
    {
      icon: CircleDashed,
      title: 'Beginner',
      subtitle: 'Start from basics',
      href: '/courses',
    },
    {
      icon: Layers3,
      title: 'Intermediate',
      subtitle: 'Build with confidence',
      href: '/courses',
    },
    {
      icon: Rocket,
      title: 'Advance',
      subtitle: 'For deep mastery',
      href: '/courses',
    },
    {
      icon: BadgePercent,
      title: 'Free',
      subtitle: 'No-cost learning',
      href: '/courses',
    },
  ];

  return (
    <section className="deferred-section bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">কোর্স <span className="text-brand">ক্যাটাগরি</span></h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:gap-6">
          {categories.map((cat, index) => (
            <Link key={index} href={cat.href} className="block">
              <div className="cursor-pointer rounded-2xl border border-transparent bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand/20 hover:shadow-md sm:p-6 md:p-8">
                <div className="text-brand mb-4 flex justify-center">
                  <cat.icon size={32} strokeWidth={1.5} className="sm:h-10 sm:w-10" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 sm:text-base lg:text-lg">{cat.title}</h3>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
