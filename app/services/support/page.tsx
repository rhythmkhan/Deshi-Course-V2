import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, HelpCircle, MessageCircle } from 'lucide-react';
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
  title: 'Course Support | Access, Payment ও Delivery Help | দেশি কোর্স',
  description:
    'দেশি কোর্সে course access, payment, delivery এবং general learning support নেওয়ার guide।',
  path: '/services/support',
  keywords: ['course support bangla', 'deshi course support', 'payment help'],
});

export const revalidate = 86400;

export default function SupportPage() {
  const services = [
    {
      title: 'Access help',
      desc: 'Course/resource access, dashboard বা delivery link নিয়ে issue হলে order contextসহ support নিন।',
      icon: <HelpCircle className="h-8 w-8" />,
    },
    {
      title: 'Payment support',
      desc: 'Payment status বা checkout issue হলে payment reference, account email এবং item name পাঠান।',
      icon: <FileText className="h-8 w-8" />,
    },
    {
      title: 'Direct contact',
      desc: 'WhatsApp, Messenger, Facebook বা email দিয়ে support request পাঠানো যায়।',
      icon: <MessageCircle className="h-8 w-8" />,
    },
  ];

  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'Support', path: '/services/support' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স Support',
            description: 'Course access, payment এবং delivery support information।',
            path: '/services/support',
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Support answer"
        title="Support request পাঠানোর best way কী?"
        answer="Account email, order/payment reference, item name এবং issue summary একসাথে পাঠালে support team দ্রুত context বুঝতে পারে।"
        points={[
          'Payment issue হলে reference দিন',
          'Access issue হলে account email দিন',
          'Screenshot থাকলে attach করুন',
          'Urgent হলে WhatsApp/Messenger ব্যবহার করুন',
        ]}
        ctaHref="/contact"
        ctaLabel="Contact page খুলুন"
      />
      <PageHeader
        title="Support"
        subtitle="Course access, payment, delivery এবং general question-এর জন্য available support path।"
      />

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-20">
          <div className="grid gap-10 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-3xl border border-gray-100 bg-white p-10 transition hover:shadow-2xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-brand">
                  {service.icon}
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">{service.title}</h2>
                <p className="leading-relaxed text-gray-700">{service.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact" className="font-bold text-brand hover:underline">
              বিস্তারিত support channel দেখুন
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
