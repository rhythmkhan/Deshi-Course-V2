import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import {
  buildBreadcrumbSchema,
  buildMetadata,
  buildWebPageSchema,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy | দেশি কোর্স',
  description:
    'দেশি কোর্স কীভাবে account, payment, support এবং analytics related information ব্যবহার করে তার privacy policy।',
  path: '/privacy',
  keywords: ['deshi course privacy', 'privacy policy bangla'],
});

export const revalidate = 86400;

export default function PrivacyPage() {
  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'Privacy Policy', path: '/privacy' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স Privacy Policy',
            description:
              'Account, payment, support এবং analytics related privacy information।',
            path: '/privacy',
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Privacy answer"
        title="দেশি কোর্স কোন তথ্য ব্যবহার করে?"
        answer="Account access, payment processing, course/resource delivery, support response এবং site improvement-এর জন্য প্রয়োজনীয় তথ্য ব্যবহার করা হতে পারে। আমরা policy page-এ data use পরিষ্কারভাবে রাখি।"
        points={[
          'Account ও contact information',
          'Payment/order reference',
          'Support conversation details',
          'Analytics ও security signals',
        ]}
      />
      <PageHeader 
        title="গোপনীয়তা নীতি" 
        subtitle="আপনার তথ্যের নিরাপত্তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ।" 
      />
      
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-20 prose prose-lg prose-purple">
          <h2 className="text-2xl font-bold mb-6">১. তথ্য সংগ্রহ</h2>
          <p className="text-gray-600 mb-8">
            আপনি account তৈরি, checkout, course/resource access, contact form বা support channel ব্যবহার করলে নাম, email, phone/contact detail, order reference এবং প্রয়োজনীয় support context সংগ্রহ করা হতে পারে।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">২. তথ্যের ব্যবহার</h2>
          <p className="text-gray-600 mb-8">
            এই তথ্য account পরিচালনা, payment/order verify করা, digital access বা delivery support দেওয়া, security monitoring এবং service improvement-এর জন্য ব্যবহার করা হয়।
          </p>
          
          <h2 className="text-2xl font-bold mb-6">৩. নিরাপত্তা</h2>
          <p className="text-gray-600 mb-8">
            আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না। Payment gateway, email/support, analytics বা hosting provider-এর মতো প্রয়োজনীয় service provider-এর সাথে সীমিত তথ্য share হতে পারে, শুধু service চালানোর প্রয়োজনে।
          </p>

          <h2 className="text-2xl font-bold mb-6">৪. যোগাযোগ</h2>
          <p className="text-gray-600 mb-8">
            Privacy বা account data নিয়ে প্রশ্ন থাকলে contact page-এর support channel দিয়ে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
