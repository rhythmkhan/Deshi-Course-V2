import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export const revalidate = 86400;
import Image from 'next/image';

export default function MentorsPage() {
  const mentors = [
    { name: 'আরিফ আহমেদ', role: 'সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার', company: 'গুগল', img: 'https://picsum.photos/seed/m1/200/200' },
    { name: 'তানজিলা হক', role: 'ইউএক্স ডিজাইনার', company: 'মেটা', img: 'https://picsum.photos/seed/m2/200/200' },
    { name: 'রাকিব হাসান', role: 'ডেটা সায়েন্টিস্ট', company: 'অ্যামাজন', img: 'https://picsum.photos/seed/m3/200/200' },
  ];

  return (
    <main>
      <Navbar />
      <PageHeader 
        title="ইন্ডাস্ট্রি মেন্টরস" 
        subtitle="বিশ্বের সেরা কোম্পানিগুলোতে কর্মরত মেন্টরদের কাছ থেকে সরাসরি শিখুন।" 
      />
      
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid md:grid-cols-3 gap-10">
            {mentors.map((mentor, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl border border-gray-100 text-center hover:shadow-2xl transition group">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-purple-100 group-hover:border-brand transition relative">
                  <Image 
                    src={mentor.img}
                    alt={mentor.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="text-xl font-bold mb-1">{mentor.name}</h4>
                <p className="text-brand font-medium mb-2">{mentor.role}</p>
                <p className="text-gray-500 text-sm">{mentor.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
