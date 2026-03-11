import Image from 'next/image';
import Link from 'next/link';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: '"শিক্ষকদের ইন্ডাস্ট্রি অভিজ্ঞতা এবং বাস্তব প্রজেক্টগুলো জটিল ধারণাগুলিকে সহজ করে তুলেছে। আমি এখন বড় বড় কোম্পানির ক্লাউড মাইগ্রেশন সামলাতে পারছি যা আগে কল্পনাও করতে পারিনি।"',
      name: 'সারা চেন',
      role: 'সিইও, লেটস কানেক্ট',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    },
    {
      quote: '"কোর্সটির হাই-এন্ড কন্টেন্ট এবং হাতে-কলমে প্র্যাকটিস আমাকে সত্যিকারের সাইবার সিকিউরিটি চ্যালেঞ্জের জন্য প্রস্তুত করেছে। তাদের ক্যারিয়ার সাপোর্ট টিম আমাকে আমার স্বপ্নের চাকরি পেতে সাহায্য করেছে।"',
      name: 'জেনিফার ওয়ালশ',
      role: 'ম্যানেজার, লেটস কানেক্ট',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-bold mb-4">শিক্ষার্থীরা <span className="text-brand">যা বলছে</span></h2>
            <p className="text-gray-500">আমাদের কোর্স নিয়ে শিক্ষার্থীদের অনুপ্রেরণামূলক মন্তব্যসমূহ।</p>
          </div>
          <Link
            href="https://facebook.com/DeshiCourse/reviews"
            target="_blank"
            rel="noreferrer"
            className="mt-6 md:mt-0 bg-brand text-white px-8 py-3 rounded-xl font-bold"
          >
            সব দেখুন
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((t, index) => (
            <div 
              key={index}
              className="bg-gray-50 p-10 rounded-3xl relative transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -top-6 left-10 w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white shadow-lg">
                <Quote className="w-6 h-6" />
              </div>
              <p className="text-lg text-gray-700 italic mb-8">{t.quote}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-300 relative">
                    <Image 
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold">{t.name}</h5>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400">★★★★★</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
