import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { markOrderCancelled } from '@/lib/payments';

interface PaymentCancelPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function PaymentCancelPage({ searchParams }: PaymentCancelPageProps) {
  const params = await searchParams;
  const orderId = params.orderId ?? '';
  const result = orderId
    ? await markOrderCancelled(orderId)
    : { ok: false, message: 'Order reference পাওয়া যায়নি।' };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-20">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">পেমেন্ট cancel হয়েছে</h1>
          <p className="mt-4 text-gray-600">
            চাইলে আবার Pay শুরু করতে পারেন, অথবা সাপোর্ট টিমের সাথে কথা বলতে পারেন।
          </p>
          <p className="mt-2 text-sm text-gray-500">{result.message}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/courses"
              className="rounded-2xl bg-brand px-6 py-3 font-bold text-white transition hover:bg-brand-dark"
            >
              আবার চেষ্টা করুন
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border border-brand/20 bg-white px-6 py-3 font-bold text-brand transition hover:bg-brand/5"
            >
              সাপোর্টে যান
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
