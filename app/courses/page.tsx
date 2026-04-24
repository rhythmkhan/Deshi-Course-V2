import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoursesCatalogBrowser from '@/components/CoursesCatalogBrowser';
import { listPublishedCourses } from '@/lib/content-store';
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

export default async function CoursesPage() {
  const courses = await listPublishedCourses();
  const schema = buildCollectionPageSchema(
    'সব কোর্স',
    'বাংলা online course collection',
    '/courses',
    courses.map((course) => ({
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
      <CoursesCatalogBrowser
        courses={courses}
        title="কোর্সসমূহ"
        subtitle="সাইটের সব live course collection থেকে আপনার প্রয়োজনের skill বেছে নিন।"
      />
      <Footer />
    </main>
  );
}
