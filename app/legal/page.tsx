import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export const revalidate = 86400;

export default function LegalPage() {
  return (
    <main>
      <Navbar />
      <PageHeader 
        title="আইনি পদক্ষেপ" 
        subtitle="আমাদের আইনি নীতিমালা এবং কমপ্লায়েন্স সংক্রান্ত তথ্য।" 
      />
      
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-20 prose prose-lg prose-purple">
          <h2 className="text-2xl font-bold mb-6">কপিরাইট লঙ্ঘন</h2>
          <p className="text-gray-600 mb-8">
            যদি আপনি মনে করেন যে আমাদের প্ল্যাটফর্মের কোনো কন্টেন্ট আপনার কপিরাইট লঙ্ঘন করেছে, তবে অনুগ্রহ করে আমাদের আইনি টিমের সাথে যোগাযোগ করুন।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">ব্যবহারকারীর আচরণ</h2>
          <p className="text-gray-600 mb-8">
            প্ল্যাটফর্মে যেকোনো ধরনের অশালীন আচরণ, স্প্যামিং বা অবৈধ কার্যকলাপের বিরুদ্ধে কঠোর আইনি ব্যবস্থা গ্রহণ করা হবে।
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
