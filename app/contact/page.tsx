import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { Mail, Phone, Facebook, MessageCircle } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'যোগাযোগ | দেশি কোর্স সাপোর্ট, WhatsApp ও Messenger',
  description:
    'দেশি কোর্সের সাথে email, WhatsApp, Facebook বা Messenger-এ যোগাযোগ করুন। course, payment বা support issue-র জন্য সরাসরি help নিন।',
  path: '/contact',
  keywords: ['deshi course contact', 'বাংলা course support', 'whatsapp support bangladesh'],
});

export const revalidate = 86400;

export default function ContactPage() {
  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'যোগাযোগ', path: '/contact' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'দেশি কোর্স যোগাযোগ',
            url: absoluteUrl('/contact'),
            description:
              'দেশি কোর্সের email, WhatsApp, Facebook এবং Messenger support details।',
          },
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Contact answer"
        title="Support নিতে কী তথ্য পাঠাবেন?"
        answer="Course access, payment বা delivery issue হলে account email, order/payment reference, item name এবং সমস্যার screenshot/details পাঠালে support team দ্রুত context বুঝতে পারে।"
        points={[
          'Email: info@deshicourse.xyz',
          'WhatsApp: +880 1813-896400',
          'Messenger ও Facebook available',
          'Contact form দিয়ে detailed issue পাঠানো যায়',
        ]}
      />
      <PageHeader 
        title="যোগাযোগ" 
        subtitle="আপনার যেকোনো প্রশ্ন বা মতামতের জন্য আমাদের সাথে যোগাযোগ করুন।" 
      />
      
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-5 sm:space-y-6 lg:space-y-12">
              <div className="flex items-start space-x-4 rounded-3xl bg-gray-50 p-5 sm:space-x-6 sm:p-6 lg:bg-transparent lg:p-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-brand shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-xl font-bold text-gray-900">ইমেইল করুন</p>
                  <Link href="mailto:info@deshicourse.xyz" className="text-gray-700 hover:text-brand">
                    info@deshicourse.xyz
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 rounded-3xl bg-gray-50 p-5 sm:space-x-6 sm:p-6 lg:bg-transparent lg:p-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-brand shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-xl font-bold text-gray-900">WhatsApp</p>
                  <Link href="https://wa.me/8801813896400" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-brand">
                    +880 1813-896400
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 rounded-3xl bg-gray-50 p-5 sm:space-x-6 sm:p-6 lg:bg-transparent lg:p-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-brand shrink-0">
                  <Facebook className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-xl font-bold text-gray-900">Facebook</p>
                  <Link href="https://www.facebook.com/DeshiCourse" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-brand">
                    @DeshiCourse
                  </Link>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-3xl bg-gray-50 p-5 sm:space-x-6 sm:p-6 lg:bg-transparent lg:p-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-brand shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-xl font-bold text-gray-900">Messenger</p>
                  <Link href="https://www.messenger.com/t/956128257564286" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-brand">
                    সরাসরি মেসেজ করুন
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-xl sm:p-8 lg:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
