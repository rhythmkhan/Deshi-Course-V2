import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Layers3, Users } from 'lucide-react';
import StructuredData from '@/components/StructuredData';
import MetaViewContentTracker from '@/components/MetaViewContentTracker';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PublicItemCheckoutPanel from '@/components/PublicItemCheckoutPanel';
import { buildMetaContentType } from '@/lib/meta';
import { getAllBundleDetailSlugs, getBundleDetailBySlug } from '@/lib/bundle-details';
import {
  buildBreadcrumbSchema,
  buildCommercialItemSchema,
  buildFaqSchema,
  buildMetadata,
} from '@/lib/seo';

interface BundleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400;
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllBundleDetailSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BundleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = getBundleDetailBySlug(slug);

  if (!bundle) {
    return buildMetadata({
      title: 'বান্ডেল পাওয়া যায়নি | দেশি কোর্স',
      description: 'এই bundle offer টি বর্তমানে পাওয়া যাচ্ছে না।',
      path: `/bundles/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${bundle.title} | ৳${bundle.bundlePrice} | Bundle Offer | দেশি কোর্স`,
    description: bundle.overview,
    path: `/bundles/${bundle.slug}`,
    image: bundle.image,
    keywords: [
      bundle.title,
      'bundle offer',
      bundle.highlight,
      'দেশি কোর্স',
    ],
  });
}

export default async function BundleDetailPage({ params }: BundleDetailPageProps) {
  const { slug } = await params;
  const bundle = getBundleDetailBySlug(slug);

  if (!bundle) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <MetaViewContentTracker
        path={`/bundles/${bundle.slug}`}
        customData={{
          currency: 'BDT',
          value: bundle.bundlePrice,
          content_name: bundle.title,
          content_type: buildMetaContentType('bundle'),
          content_category: 'Course Bundle',
          content_ids: [bundle.slug],
          contents: [{ id: bundle.slug, quantity: 1, item_price: bundle.bundlePrice }],
          num_items: 1,
        }}
      />
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'বান্ডেলসমূহ', path: '/bundles' },
            { name: bundle.title, path: `/bundles/${bundle.slug}` },
          ]),
          buildCommercialItemSchema({
            name: bundle.title,
            description: bundle.overview,
            path: `/bundles/${bundle.slug}`,
            image: bundle.image,
            price: bundle.bundlePrice,
            category: 'Course Bundle',
            keywords: [bundle.title, bundle.highlight, 'bundle'],
          }),
          buildFaqSchema(bundle.faq),
        ]}
      />
      <Navbar />

      <section className="border-b border-gray-100 bg-[linear-gradient(180deg,#faf5ff_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-20 lg:py-14">
          <Link
            href="/bundles"
            className="mb-8 inline-flex items-center text-sm font-bold text-brand transition hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            সব বান্ডেলে ফিরে যান
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-brand px-4 py-1.5 font-bold text-white">বান্ডেল</span>
                <span className="rounded-full bg-white px-4 py-1.5 font-bold text-gray-700 ring-1 ring-gray-200">
                  {bundle.accessLabel}
                </span>
                <span className="rounded-full bg-white px-4 py-1.5 font-bold text-gray-700 ring-1 ring-gray-200">
                  {bundle.highlight}
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {bundle.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                {bundle.overview}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {bundle.facts.map((fact) => (
                  <StatCard key={fact.label} value={fact.value} label={fact.label} />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-4 shadow-2xl ring-1 ring-gray-100 sm:p-6">
              <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <Image
                  src={bundle.image}
                  alt={bundle.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <PublicItemCheckoutPanel
                item={{ type: 'bundle', slug: bundle.slug }}
                originalPrice={bundle.originalPrice}
                highlights={bundle.featureMetrics}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-20">
          <div className="space-y-10">
            <SectionBlock title="এই bundle-এ যেসব course আছে">
              <div className="grid gap-4 sm:grid-cols-2">
                {bundle.includedCourses.map((course) => (
                  <Link
                    key={course.slug}
                    href={`/courses/${course.slug}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:border-brand/20 hover:bg-white"
                  >
                    <p className="text-sm font-medium text-brand">{course.category}</p>
                    <h3 className="mt-2 text-lg font-bold text-gray-900">{course.title}</h3>
                    <p className="mt-3 text-sm text-gray-500">
                      {course.accessLabel} • {course.instructor}
                    </p>
                  </Link>
                ))}
              </div>
            </SectionBlock>

            <SectionGrid title="Bundle-এ যা যা থাকছে" items={bundle.deliverables} />

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionList title="যাদের জন্য bundle" items={bundle.audience} />
              <StepSection title="কীভাবে ব্যবহার করবেন" items={bundle.workflow} />
            </div>

            <FaqSection items={bundle.faq} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">দ্রুত তথ্য</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <InfoRow label="ধরন" value="Bundle offer" />
                <InfoRow label="মূল কোর্স" value={`${bundle.includedCourseSlugs.length}টি`} />
                <InfoRow label="অ্যাক্সেস" value={bundle.accessLabel} />
              </div>
            </div>

            <div className="rounded-[2rem] bg-brand p-6 text-white shadow-lg">
              <h2 className="mb-3 text-xl font-bold">Support & Access</h2>
              <p className="text-sm leading-relaxed text-white/80">{bundle.support}</p>
              <Link
                href={`/signin?redirect=${encodeURIComponent(`/bundles/${bundle.slug}`)}`}
                className="mt-5 block w-full rounded-2xl bg-white px-5 py-3 text-center font-bold text-brand transition hover:bg-gray-100"
              >
                পেমেন্টের আগে sign in করুন
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: ReactElement | ReactElement[] }) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function SectionGrid({ title, items }: { title: string; items: string[] }) {
  return (
    <SectionBlock title={title}>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex rounded-2xl bg-gray-50 p-4">
            <BadgeCheck className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{item}</p>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

function SectionList({ title, items }: { title: string; items: string[] }) {
  return (
    <SectionBlock title={title}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex text-sm text-gray-600 sm:text-base">
            <Users className="mr-3 mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {item}
          </li>
        ))}
      </ul>
    </SectionBlock>
  );
}

function StepSection({ title, items }: { title: string; items: string[] }) {
  return (
    <SectionBlock title={title}>
      <div className="space-y-4">
        {items.map((step, index) => (
          <div key={step} className="rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-brand">Step {index + 1}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{step}</p>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

function FaqSection({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <SectionBlock title="সচরাচর জিজ্ঞাসা">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.question} className="rounded-2xl border border-gray-100 p-5">
            <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-lg">{item.question}</h3>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{item.answer}</p>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="font-medium text-gray-500">{label}</span>
      <span className="text-right font-bold text-gray-900">{value}</span>
    </div>
  );
}
