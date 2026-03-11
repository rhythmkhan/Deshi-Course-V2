import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export const revalidate = 86400;

export default function TermsPage() {
  return (
    <main>
      <Navbar />
      <PageHeader 
        title="শর্তাবলী" 
        subtitle="আমাদের পরিষেবা ব্যবহারের আগে অনুগ্রহ করে শর্তাবলী পড়ে নিন।" 
      />
      
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-20 prose prose-lg prose-purple">
          <h2 className="text-2xl font-bold mb-6">১. অ্যাকাউন্ট নিবন্ধন</h2>
          <p className="text-gray-600 mb-8">
            আমাদের কোর্সগুলিতে অ্যাক্সেস পেতে আপনাকে একটি বৈধ অ্যাকাউন্ট তৈরি করতে হবে। আপনার অ্যাকাউন্টের তথ্যের গোপনীয়তা রক্ষার দায়িত্ব আপনার।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">২. পেমেন্ট ও রিফান্ড</h2>
          <p className="text-gray-600 mb-8">
            কোর্সের ফি অগ্রিম প্রদান করতে হবে। বিশেষ ক্ষেত্রে আমাদের রিফান্ড পলিসি অনুযায়ী রিফান্ড প্রদান করা হতে পারে।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">৩. মেধা সম্পদ</h2>
          <p className="text-gray-600 mb-8">
            প্ল্যাটফর্মের সমস্ত কন্টেন্ট, ভিডিও এবং ম্যাটেরিয়াল দেশি কোর্সের মেধা সম্পদ। এগুলো অনুমতি ছাড়া বিতরণ বা বাণিজ্যিক উদ্দেশ্যে ব্যবহার করা নিষিদ্ধ।
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
