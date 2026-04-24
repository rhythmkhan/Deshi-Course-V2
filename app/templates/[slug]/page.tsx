import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Box, Sparkles, Users } from 'lucide-react';
import StructuredData from '@/components/StructuredData';
import MetaViewContentTracker from '@/components/MetaViewContentTracker';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PublicItemCheckoutPanel from '@/components/PublicItemCheckoutPanel';
import {
  getPublishedProductDetailBySlug,
  listPublishedProducts,
} from '@/lib/content-store';
import { buildMetaContentType } from '@/lib/meta';
import {
  buildBreadcrumbSchema,
  buildCommercialItemSchema,
  buildFaqSchema,
  buildMetadata,
} from '@/lib/seo';

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await listPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductDetailBySlug(slug);

  if (!product) {
    return buildMetadata({
      title: 'প্রোডাক্ট পাওয়া যায়নি | দেশি কোর্স',
      description: 'এই প্রোডাক্টটি বর্তমানে পাওয়া যাচ্ছে না।',
      path: `/templates/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${product.title} | ৳${product.price} | Digital Product | দেশি কোর্স`,
    description: product.overview,
    path: `/templates/${product.slug}`,
    image: product.image,
    keywords: [
      product.title,
      product.type,
      'digital product bangla',
      'template library',
      'দেশি কোর্স',
    ],
  });
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { slug } = await params;
  const product = await getPublishedProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <MetaViewContentTracker
        path={`/templates/${product.slug}`}
        customData={{
          currency: 'BDT',
          value: product.price,
          content_name: product.title,
          content_type: buildMetaContentType('shop'),
          content_category: product.type,
          content_ids: [product.slug],
          contents: [{ id: product.slug, quantity: 1, item_price: product.price }],
          num_items: 1,
        }}
      />
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'প্রোডাক্টসমূহ', path: '/templates' },
            { name: product.title, path: `/templates/${product.slug}` },
          ]),
          buildCommercialItemSchema({
            name: product.title,
            description: product.overview,
            path: `/templates/${product.slug}`,
            image: product.image,
            price: product.price,
            category: product.type,
            keywords: [product.title, product.type, product.format],
          }),
          buildFaqSchema(product.faq),
        ]}
      />
      <Navbar />

      <section className="border-b border-gray-100 bg-[linear-gradient(180deg,#faf5ff_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-20 lg:py-14">
          <Link
            href="/templates"
            className="mb-8 inline-flex items-center text-sm font-bold text-brand transition hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            সব প্রোডাক্টে ফিরে যান
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-brand px-4 py-1.5 font-bold text-white">{product.type}</span>
                <span className="rounded-full bg-white px-4 py-1.5 font-bold text-gray-700 ring-1 ring-gray-200">
                  {product.accessLabel}
                </span>
                {product.tag && (
                  <span className="rounded-full bg-white px-4 py-1.5 font-bold text-gray-700 ring-1 ring-gray-200">
                    {product.tag}
                  </span>
                )}
              </div>

              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {product.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                {product.overview}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {product.facts.map((fact) => (
                  <StatCard key={fact.label} value={fact.value} label={fact.label} />
                ))}
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-2">
                <PreviewCard
                  icon={<Box className="h-5 w-5" />}
                  title="এই product-এ যা পাবেন"
                  items={product.deliverables.slice(0, 4)}
                />
                <PreviewCard
                  icon={<Sparkles className="h-5 w-5" />}
                  title="যেভাবে কাজে লাগবে"
                  items={product.useCases.slice(0, 4)}
                />
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-4 shadow-2xl ring-1 ring-gray-100 sm:p-6">
              <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  unoptimized={product.image.startsWith('/api/catalog-art')}
                  priority
                />
              </div>

              <Suspense fallback={null}>
                <PublicItemCheckoutPanel
                  item={{ type: 'shop', slug: product.slug }}
                  originalPrice={product.price}
                  highlights={product.featureMetrics}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-20">
          <div className="space-y-10">
            <SectionGrid title="এই product-এ কী কী আছে" items={product.deliverables} />

            <div className="grid gap-6 lg:grid-cols-2">
              <StepSection title="যেভাবে use করবেন" items={product.workflow} />
              <AudienceSection title="যাদের জন্য product" items={product.audience} />
            </div>

            <SectionGrid title="Use case" items={product.useCases} />
            <FaqSection items={product.faq} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">দ্রুত তথ্য</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <InfoRow label="ধরন" value={product.type} />
                <InfoRow label="Format" value={product.format} />
                <InfoRow label="Access" value={product.accessLabel} />
              </div>
            </div>

            <div className="rounded-[2rem] bg-brand p-6 text-white shadow-lg">
              <h2 className="mb-3 text-xl font-bold">Support & Delivery</h2>
              <p className="text-sm leading-relaxed text-white/80">{product.support}</p>
              <Link
                href={`/signin?redirect=${encodeURIComponent(`/templates/${product.slug}`)}`}
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

function PreviewCard({
  icon,
  title,
  items,
}: {
  icon: ReactElement;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          {icon}
        </span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex rounded-2xl bg-gray-50 p-4">
            <BadgeCheck className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="text-sm leading-relaxed text-gray-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionGrid({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex rounded-2xl bg-gray-50 p-4">
            <BadgeCheck className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-4">
        {items.map((step, index) => (
          <div key={step} className="rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-brand">Step {index + 1}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AudienceSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex text-sm text-gray-600 sm:text-base">
            <Users className="mr-3 mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqSection({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">সচরাচর জিজ্ঞাসা</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.question} className="rounded-2xl border border-gray-100 p-5">
            <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-lg">{item.question}</h3>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
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
