import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export const revalidate = 86400;

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />
      <PageHeader 
        title="গোপনীয়তা নীতি" 
        subtitle="আপনার তথ্যের নিরাপত্তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ।" 
      />
      
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-20 prose prose-lg prose-purple">
          <h2 className="text-2xl font-bold mb-6">১. তথ্য সংগ্রহ</h2>
          <p className="text-gray-600 mb-8">
            আমরা যখন আপনি আমাদের প্ল্যাটফর্মে নিবন্ধন করেন বা আমাদের পরিষেবাগুলি ব্যবহার করেন তখন আমরা আপনার নাম, ইমেইল ঠিকানা এবং অন্যান্য প্রয়োজনীয় তথ্য সংগ্রহ করি।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">২. তথ্যের ব্যবহার</h2>
          <p className="text-gray-600 mb-8">
            আপনার সংগৃহীত তথ্য আমরা আপনার অ্যাকাউন্ট পরিচালনা করতে, আপনাকে কোর্সের আপডেট পাঠাতে এবং আমাদের পরিষেবা উন্নত করতে ব্যবহার করি।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">৩. নিরাপত্তা</h2>
          <p className="text-gray-600 mb-8">
            আমরা আপনার ব্যক্তিগত তথ্যের নিরাপত্তা নিশ্চিত করতে আধুনিক প্রযুক্তি এবং নিরাপত্তা ব্যবস্থা ব্যবহার করি। আমরা কখনোই আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
