import Image from 'next/image';
import Link from 'next/link';
import { Quote } from 'lucide-react';
import type { ManagedTestimonial } from '@/lib/content-types';

export default function Testimonials({
  testimonials = [
    {
      id: 'fallback-testimonial-1',
      quote: 'শিক্ষকদের ইন্ডাস্ট্রি অভিজ্ঞতা এবং বাস্তব প্রজেক্টগুলো জটিল ধারণাগুলিকে সহজ করে তুলেছে।',
      name: 'সারা চেন',
      role: 'সিইও, লেটস কানেক্ট',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
      rating: 5,
      isPublished: true,
      sortOrder: 0,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    },
    {
      id: 'fallback-testimonial-2',
      quote: 'প্র্যাকটিক্যাল কন্টেন্ট এবং হাতে-কলমে practice আমাকে real challenge-এর জন্য প্রস্তুত করেছে।',
      name: 'জেনিফার ওয়ালশ',
      role: 'ম্যানেজার, লেটস কানেক্ট',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
      rating: 5,
      isPublished: true,
      sortOrder: 1,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    },
  ],
}: {
  testimonials?: ManagedTestimonial[];
}) {
  return (
    <section className="deferred-section py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        <div className="mb-16">
          <div>
            <h2 className="text-4xl font-bold mb-4">শিক্ষার্থীরা <span className="text-brand">যা বলছে</span></h2>
            <p className="text-gray-600">আমাদের কোর্স নিয়ে শিক্ষার্থীদের অনুপ্রেরণামূলক মন্তব্যসমূহ।</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((t, index) => (
            <div 
              key={t.id || `${t.name}-${index}`}
              className="bg-gray-50 p-10 rounded-3xl relative transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -top-6 right-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                <Quote className="w-6 h-6" />
              </div>
              <p className="mb-8 text-lg italic text-gray-700">
                <span aria-hidden="true">&ldquo;</span>
                {t.quote}
                <span aria-hidden="true">&rdquo;</span>
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-300 relative">
                    <Image 
                      src={t.avatarUrl || '/hero.webp'}
                      alt={t.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-600">{t.role}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400">{'★'.repeat(t.rating || 5)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="https://facebook.com/DeshiCourse/reviews"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-xl bg-brand px-8 py-3 font-bold text-white"
          >
            সব দেখুন
          </Link>
        </div>
      </div>
    </section>
  );
}
