import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export const revalidate = 86400;
import FeaturedCourses from '@/components/FeaturedCourses';

export default function CertificationPage() {
  return (
    <main>
      <Navbar />
      <PageHeader 
        title="সার্টিফিকেশন কোর্স" 
        subtitle="ইন্ডাস্ট্রি স্বীকৃত সার্টিফিকেট অর্জন করে আপনার ক্যারিয়ারকে এগিয়ে নিন।" 
      />
      <FeaturedCourses />
      <Footer />
    </main>
  );
}
