import type { Metadata } from 'next';
import Link from 'next/link';
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
  title: 'Refund Policy | দেশি কোর্স',
  description:
    'দেশি কোর্সের refund policy: payment complete হওয়ার পর delivery/access status অনুযায়ী refund request কীভাবে বিবেচিত হয়।',
  path: '/refund-policy',
  keywords: ['deshi course refund policy', 'course refund bangla', 'digital product refund'],
});

export const revalidate = 86400;

export default function RefundPolicyPage() {
  return (
    <main>
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'Refund Policy', path: '/refund-policy' },
          ]),
          buildWebPageSchema({
            name: 'দেশি কোর্স Refund Policy',
            description:
              'Payment, digital access, delivery link এবং refund request condition।',
            path: '/refund-policy',
          }),
        ]}
      />
      <Navbar />
      <AnswerBlock
        eyebrow="Refund answer"
        title="কখন refund request বিবেচনা হতে পারে?"
        answer="Payment complete হওয়ার পর যদি course access, delivery link, group access বা digital resource handover এখনো না হয়ে থাকে, যাচাই সাপেক্ষে refund request বিবেচনা করা যেতে পারে। Access/link/resource/share/group entry দেওয়া হলে refund প্রযোজ্য নয়।"
        points={[
          'Order/payment reference লাগবে',
          'Delivery/access status verify করা হবে',
          'Digital access delivered হলে refund নয়',
          'Support channel দিয়ে request করতে হবে',
        ]}
        ctaHref="/contact"
        ctaLabel="Refund বিষয়ে contact করুন"
      />
      <PageHeader
        title="Refund Policy"
        subtitle="Digital course, bundle এবং resource access-এর ক্ষেত্রে refund condition পরিষ্কারভাবে জানুন।"
      />

      <section className="py-24">
        <div className="prose prose-lg prose-purple mx-auto max-w-4xl px-6 lg:px-20">
          <h2 className="text-2xl font-bold mb-6">১. Refund বিবেচনার শর্ত</h2>
          <p className="text-gray-600 mb-8">
            Payment complete হওয়ার পর যদি এখনো course access, delivery link, group access,
            download/resource handover বা account unlock না হয়ে থাকে, তাহলে order যাচাই
            সাপেক্ষে refund request বিবেচনা করা যেতে পারে।
          </p>

          <h2 className="text-2xl font-bold mb-6">২. Refund প্রযোজ্য নয়</h2>
          <p className="text-gray-600 mb-8">
            একবার course deliver হয়ে গেলে, access/link/resource/share/group entry দেওয়া হলে,
            অথবা course account-এ unlock হয়ে গেলে refund প্রযোজ্য নয়। Digital product ও
            template/resource access-এর ক্ষেত্রেও delivery সম্পন্ন হলে একই policy প্রযোজ্য।
          </p>

          <h2 className="text-2xl font-bold mb-6">৩. Request করার পদ্ধতি</h2>
          <p className="text-gray-600 mb-8">
            Refund request করতে account email, order/payment reference, item name এবং সমস্যার
            সংক্ষিপ্ত বিবরণসহ <Link href="/contact">contact page</Link> দিয়ে support team-এ
            যোগাযোগ করুন।
          </p>

          <h2 className="text-2xl font-bold mb-6">৪. Related policy</h2>
          <p className="text-gray-600 mb-8">
            Checkout করার আগে <Link href="/terms">terms page</Link> এবং product/course detail
            page-এর access note পড়ে নেওয়া উচিত।
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
