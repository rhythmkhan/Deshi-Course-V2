import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { FAQ_ITEMS } from '@/lib/faq-data';

export const revalidate = 86400;

export default function FaqPage() {
  return (
    <main>
      <Navbar />
      <PageHeader
        title="সচরাচর জিজ্ঞাসিত প্রশ্নাবলী"
        subtitle="কোর্স কেনা, payment, access, certificate এবং support সংক্রান্ত সাধারণ প্রশ্নের বিস্তারিত উত্তর এখানে পাবেন।"
      />

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-20">
          <div className="rounded-[2rem] bg-gray-50 p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <HelpCircle className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">প্রয়োজনীয় সহায়তা দ্রুত খুঁজে নিন</h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-600 sm:text-base">
              সবচেয়ে common প্রশ্নগুলোর উত্তর আমরা পরিষ্কারভাবে এক জায়গায় সাজিয়েছি, যাতে enrollment থেকে certificate পর্যন্ত সবকিছু দ্রুত বুঝতে পারেন।
            </p>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="rounded-2xl bg-white p-4">কোর্স access, payment status এবং certificate policy সম্পর্কে বিস্তারিত তথ্য</p>
              <p className="rounded-2xl bg-white p-4">beginner learners-এর জন্য clear direction ও course suitability guidance</p>
              <p className="rounded-2xl bg-white p-4">প্রয়োজনে contact/support path-এ যাওয়ার direct next step</p>
            </div>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center font-bold text-brand transition hover:underline"
            >
              আরও সহায়তা লাগলে যোগাযোগ করুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={item.question}
                className="group rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition open:border-brand/20 open:shadow-md sm:p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    {index + 1}. {item.question}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-90 group-open:text-brand" />
                </summary>
                <p className="pt-4 text-sm leading-relaxed text-gray-600 sm:text-base">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
