import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoursesCatalogBrowser from '@/components/CoursesCatalogBrowser';
import AnswerBlock from '@/components/AnswerBlock';
import {
  listPublishedCourses,
  listSeoCourses,
} from '@/lib/content-store';
import StructuredData from '@/components/StructuredData';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'সব বাংলা কোর্স | n8n, Video Editing, Flutter, Cyber Security | দেশি কোর্স',
  description:
    'n8n automation, video editing, flutter app development, cyber security, AI money making এবং YouTube automation সহ সব বাংলা online course একসাথে দেখুন।',
  path: '/courses',
  keywords: [
    'বাংলা course',
    'n8n course bangla',
    'video editing course bangla',
    'flutter course bangla',
    'cyber security course bangla',
    'youtube automation course bangla',
  ],
});

export const revalidate = 86400;

interface CoursesPageProps {
  searchParams?: Promise<{ search?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialQuery = resolvedSearchParams.search?.trim() || '';
  const [courses, seoCourses] = await Promise.all([
    listPublishedCourses(),
    listSeoCourses(),
  ]);
  const schema = buildCollectionPageSchema(
    'সব কোর্স',
    'বাংলা online course collection',
    '/courses',
    seoCourses.map((course) => ({
      name: course.title,
      path: `/courses/${course.slug}`,
    })),
  );

  return (
    <main>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'হোম', path: '/' },
          { name: 'কোর্সসমূহ', path: '/courses' },
        ])}
      />
      <StructuredData data={schema} />
      <Navbar />
      <AnswerBlock
        eyebrow="Course catalog answer"
        title="কোন বাংলা online course দিয়ে শুরু করবেন?"
        answer="প্রথমে নিজের goal, current skill level, budget এবং access preference মিলিয়ে course shortlist করুন। দেশি কোর্স catalog-এ visible course data, category, price এবং access label দেখে compare করা যায়।"
        points={[
          'Search দিয়ে course/category খুঁজুন',
          'Beginner, intermediate বা free filter ব্যবহার করুন',
          'Course detail page-এ FAQ ও access note পড়ুন',
          'Support লাগলে contact page ব্যবহার করুন',
        ]}
      />
      <CoursesCatalogBrowser
        courses={courses}
        title="কোর্সসমূহ"
        subtitle="সাইটের সব live course collection থেকে আপনার প্রয়োজনের skill বেছে নিন।"
        initialQuery={initialQuery}
      />
      <Footer />
    </main>
  );
}
