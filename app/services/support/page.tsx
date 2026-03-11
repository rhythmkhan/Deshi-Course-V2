import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export const revalidate = 86400;
import { Briefcase, FileText, Search } from 'lucide-react';

export default function SupportPage() {
  const services = [
    { title: 'রিজিউম বিল্ডিং', desc: 'পেশাদার রিজিউম তৈরি করতে আমাদের বিশেষজ্ঞরা আপনাকে সাহায্য করবেন।', icon: <FileText className="w-8 h-8" /> },
    { title: 'জব প্লেসমেন্ট', desc: 'আমাদের পার্টনার কোম্পানিগুলোতে সরাসরি ইন্টারভিউয়ের সুযোগ পান।', icon: <Briefcase className="w-8 h-8" /> },
    { title: 'মক ইন্টারভিউ', desc: 'আসল ইন্টারভিউয়ের আগে নিজেকে ঝালিয়ে নিন মক ইন্টারভিউয়ের মাধ্যমে।', icon: <Search className="w-8 h-8" /> },
  ];

  return (
    <main>
      <Navbar />
      <PageHeader 
        title="ক্যারিয়ার সাপোর্ট" 
        subtitle="কোর্স শেষে আপনার স্বপ্নের চাকরি পেতে আমরা আছি আপনার পাশে।" 
      />
      
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid md:grid-cols-3 gap-10">
            {services.map((s, index) => (
              <div key={index} className="p-10 bg-white rounded-3xl border border-gray-100 hover:shadow-2xl transition">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-brand mb-6">
                  {s.icon}
                </div>
                <p className="mb-4 text-2xl font-bold text-gray-900">{s.title}</p>
                <p className="leading-relaxed text-gray-700">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
