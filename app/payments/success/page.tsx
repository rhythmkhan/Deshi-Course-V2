import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MetaPurchaseTracker from '@/components/MetaPurchaseTracker';
import Footer from '@/components/Footer';
import PaymentSuccessCartSync from '@/components/PaymentSuccessCartSync';
import { classifyPaymentStatus } from '@/lib/piprapay';
import { finalizePipraPayOrder } from '@/lib/payments';

interface PaymentResult {
  ok: boolean;
  message: string;
  courseSlug?: string;
  metaPurchaseEventId?: string;
  metaPurchasePath?: string;
  metaPurchaseCustomData?: Record<string, unknown>;
}

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    pp_id?: string;
    status?: string;
    payment_status?: string;
    pp_status?: string;
    transaction_ref?: string;
    trx_id?: string;
    transaction_id?: string;
    fromCart?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const orderId = params.orderId ?? '';
  const ppId = params.pp_id ?? '';
  const fromCart = params.fromCart === '1';
  const redirectStatus =
    params.pp_status ?? params.payment_status ?? params.status ?? '';
  const classifiedStatus = classifyPaymentStatus(redirectStatus);

  if (
    orderId &&
    !ppId &&
    (classifiedStatus.kind === 'cancelled' || classifiedStatus.kind === 'failed')
  ) {
    redirect(`/payments/cancel?orderId=${orderId}`);
  }

  const result: PaymentResult =
    orderId && ppId
      ? await finalizePipraPayOrder(orderId, ppId)
      : { ok: false, message: 'Payment info পাওয়া যায়নি।' };

  if (
    orderId &&
    !result.ok &&
    (classifiedStatus.kind === 'cancelled' || classifiedStatus.kind === 'failed')
  ) {
    redirect(`/payments/cancel?orderId=${orderId}`);
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PaymentSuccessCartSync shouldClearCart={result.ok && fromCart} />
      {result.ok && result.metaPurchaseEventId && result.metaPurchasePath && result.metaPurchaseCustomData && (
        <MetaPurchaseTracker
          eventId={result.metaPurchaseEventId}
          path={result.metaPurchasePath}
          customData={result.metaPurchaseCustomData}
        />
      )}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-20">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {result.ok ? 'পেমেন্ট সফল হয়েছে' : 'পেমেন্ট verify বাকি আছে'}
          </h1>
          <p className="mt-4 text-gray-600">{result.message}</p>
          {result.ok && fromCart && (
            <p className="mt-2 text-sm text-gray-500">কার্টের item-গুলো এখন checkout complete হিসেবে clear হয়ে গেছে।</p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-brand px-6 py-3 font-bold text-white transition hover:bg-brand-dark"
            >
              ড্যাশবোর্ডে যান
            </Link>
            {result.courseSlug && (
              <Link
                href={`/courses/${result.courseSlug}`}
                className="rounded-2xl border border-brand/20 bg-white px-6 py-3 font-bold text-brand transition hover:bg-brand/5"
              >
                কোর্সে ফিরে যান
              </Link>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
