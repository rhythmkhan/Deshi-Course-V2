import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Users, Wrench } from 'lucide-react';
import StructuredData from '@/components/StructuredData';
import MetaViewContentTracker from '@/components/MetaViewContentTracker';
import Navbar from '@/components/Navbar';
import CoursePurchasePanel from '@/components/CoursePurchasePanel';
import Footer from '@/components/Footer';
import { COURSE_DETAILS, getCourseBySlug } from '@/lib/course-details';
import { buildMetaContentType } from '@/lib/meta';
import {
  buildBreadcrumbSchema,
  buildCommercialItemSchema,
  buildFaqSchema,
  buildMetadata,
} from '@/lib/seo';

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400;
export const dynamicParams = false;

const levelLabel = {
  beginner: 'বিগিনার',
  intermediate: 'ইন্টারমিডিয়েট',
  advanced: 'অ্যাডভান্সড',
} as const;

export async function generateStaticParams() {
  return COURSE_DETAILS.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return buildMetadata({
      title: 'কোর্স পাওয়া যায়নি | দেশি কোর্স',
      description: 'এই কোর্সটি বর্তমানে পাওয়া যাচ্ছে না।',
      path: `/courses/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${course.title} কোর্স | ৳${course.price} | Lifetime Access | দেশি কোর্স`,
    description: course.heroSummary,
    path: `/courses/${course.slug}`,
    image: course.image,
    keywords: [
      course.title,
      course.category,
      'বাংলা online course',
      'lifetime access course',
      'দেশি কোর্স',
    ],
  });
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <MetaViewContentTracker
        path={`/courses/${course.slug}`}
        customData={{
          currency: 'BDT',
          value: course.price,
          content_name: course.title,
          content_type: buildMetaContentType('course'),
          content_category: course.category,
          content_ids: [course.slug],
          contents: [{ id: course.slug, quantity: 1, item_price: course.price }],
          num_items: 1,
        }}
      />
      <StructuredData
        data={[
          buildBreadcrumbSchema([
            { name: 'হোম', path: '/' },
            { name: 'কোর্সসমূহ', path: '/courses' },
            { name: course.title, path: `/courses/${course.slug}` },
          ]),
          buildCommercialItemSchema({
            name: course.title,
            description: course.description,
            path: `/courses/${course.slug}`,
            image: course.image,
            price: course.price,
            category: course.category,
            keywords: [course.title, course.category, course.instructor],
          }),
          buildFaqSchema(course.faq),
        ]}
      />
      <Navbar />

      <section className="border-b border-gray-100 bg-[linear-gradient(180deg,#faf5ff_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-20 lg:py-14">
          <Link
            href="/courses"
            className="mb-8 inline-flex items-center text-sm font-bold text-brand transition hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            সব কোর্সে ফিরে যান
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-brand px-4 py-1.5 font-bold text-white">{course.category}</span>
                <span className="rounded-full bg-white px-4 py-1.5 font-bold text-gray-700 ring-1 ring-gray-200">
                  {levelLabel[course.level]}
                </span>
                <span className="rounded-full bg-white px-4 py-1.5 font-bold text-gray-700 ring-1 ring-gray-200">
                  {course.accessLabel}
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                {course.heroSummary}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {course.facts.map((fact) => (
                  <StatCard key={fact.label} value={fact.value} label={fact.label} />
                ))}
              </div>

              <div className="mt-8 hidden space-y-6 lg:block">
                <SectionBlock title="কোর্স সম্পর্কে">
                  <p className="text-base leading-relaxed text-gray-600">{course.description}</p>
                </SectionBlock>

                <SectionGrid title="এই কোর্সে যা পাবেন" items={course.deliverables} />
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-4 shadow-2xl ring-1 ring-gray-100 sm:p-6">
              <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  unoptimized={course.image.startsWith('/api/catalog-art')}
                  priority
                />
              </div>

              <Suspense fallback={null}>
                <CoursePurchasePanel course={course} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-20">
          <div className="space-y-10">
            <div className="lg:hidden">
              <SectionBlock title="কোর্স সম্পর্কে">
                <p className="text-base leading-relaxed text-gray-600">{course.description}</p>
              </SectionBlock>
            </div>

            <div className="lg:hidden">
              <SectionGrid title="এই কোর্সে যা পাবেন" items={course.deliverables} />
            </div>

            {course.modules && course.modules.length > 0 && (
              <CourseModulesSection modules={course.modules} />
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionList title="যাদের জন্য এই কোর্স" items={course.audience} icon={<Users className="mr-3 mt-0.5 h-4 w-4 shrink-0 text-brand" />} />
              <StepSection title="শেখার workflow" items={course.workflow} />
            </div>

            <SectionBlock title="টুলস ও সাপোর্ট">
              <div className="grid gap-6 lg:grid-cols-2">
                <InfoCard
                  icon={<Wrench className="mb-4 h-5 w-5 text-brand" />}
                  title="ব্যবহৃত টুলস"
                  content={<ul className="space-y-2 text-sm text-gray-600">{course.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>}
                />
                <InfoCard
                  icon={<Users className="mb-4 h-5 w-5 text-brand" />}
                  title="সাপোর্ট সিস্টেম"
                  content={<p className="text-sm leading-relaxed text-gray-600">{course.support}</p>}
                />
              </div>
            </SectionBlock>

            <FaqSection items={course.faq} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">দ্রুত তথ্য</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <InfoRow label="লেভেল" value={levelLabel[course.level]} />
                <InfoRow label="অ্যাক্সেস" value={course.accessLabel} />
                <InfoRow label="ভাষা" value={course.language} />
                <InfoRow label="ইনস্ট্রাক্টর" value={course.instructor} />
              </div>
            </div>

            <div className="rounded-[2rem] bg-brand p-6 text-white shadow-lg">
              <h2 className="mb-3 text-xl font-bold">Outcome</h2>
              <p className="text-sm leading-relaxed text-white/80">{course.outcomeSummary}</p>
              <Link
                href={`/signin?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`}
                className="mt-5 block w-full rounded-2xl bg-white px-5 py-3 text-center font-bold text-brand transition hover:bg-gray-100"
              >
                ভর্তি সংক্রান্ত সহায়তা নিন
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

function SectionList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: ReactElement;
}) {
  return (
    <SectionBlock title={title}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex text-sm text-gray-600 sm:text-base">
            {icon}
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

function CourseModulesSection({
  modules,
}: {
  modules: Array<{ title: string; lessons: string[] }>;
}) {
  return (
    <SectionBlock title="কোর্স মডিউল">
      <div className="space-y-5">
        {modules.map((module) => (
          <div key={module.title} className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
            <ul className="mt-4 space-y-3">
              {module.lessons.map((lesson) => (
                <li key={lesson} className="flex text-sm text-gray-600 sm:text-base">
                  <BadgeCheck className="mr-3 mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

function InfoCard({
  icon,
  title,
  content,
}: {
  icon: ReactElement;
  title: string;
  content: ReactElement;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      {icon}
      <h3 className="mb-3 text-lg font-bold text-gray-900">{title}</h3>
      {content}
    </div>
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
