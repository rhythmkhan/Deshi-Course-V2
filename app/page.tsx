import type { Metadata } from 'next';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import FeaturedCourses from '@/components/FeaturedCourses';
import BundleShowcaseStatic from '@/components/BundleShowcaseStatic';
import ProductShowcaseStatic from '@/components/ProductShowcaseStatic';
import Testimonials from '@/components/Testimonials';
import Support from '@/components/Support';
import LatestBlog from '@/components/LatestBlog';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import AnswerBlock from '@/components/AnswerBlock';
import {
  getHomepageSection,
  listActiveAnnouncementBanners,
  listFeaturedCourses,
  listPublishedFaqEntries,
  listPublishedBlogPosts,
  listPublishedBundles,
  listPublishedProducts,
  listPublishedTestimonials,
  listSeoBundles,
  listSeoCourses,
  listSeoProducts,
} from '@/lib/content-store';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFaqSchema,
  buildMetadata,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'বাংলা Online Course, Templates, Bundles ও Skill Learning | দেশি কোর্স',
  description:
    'বাংলায় practical online course, bundle এবং digital product collection। n8n automation, vibe coding, video editing, flutter, cyber security ও আরো অনেক skill এক জায়গায়।',
  path: '/',
  keywords: [
    'বাংলা online course',
    'online course bangladesh',
    'n8n automation bangla',
    'vibe coding course',
    'video editing course bangla',
    'digital templates bangla',
  ],
});

export const dynamic = 'force-static';
export const revalidate = 86400;

export default async function Home() {
  const [heroSection, banners] = await Promise.all([
    getHomepageSection('hero'),
    listActiveAnnouncementBanners(),
  ]);

  return (
    <main className="min-h-screen">
      <Navbar />
      {banners.length > 0 ? (
        <section className="border-b border-brand/10 bg-brand/5 px-4 py-3 text-center text-sm text-brand">
          <span className="font-semibold">{banners[0].title}</span>
          {banners[0].body ? <span className="ml-2 text-gray-600">{banners[0].body}</span> : null}
        </section>
      ) : null}
      <Hero sectionData={heroSection} />
      <Suspense fallback={null}>
        <HomeDeferredSections />
      </Suspense>
    </main>
  );
}

async function HomeDeferredSections() {
  const [
    featuredCourses,
    bundles,
    products,
    posts,
    featureSection,
    supportSection,
    testimonials,
    siteFaq,
    seoCourses,
    seoBundles,
    seoProducts,
  ] = await Promise.all([
    listFeaturedCourses(),
    listPublishedBundles(),
    listPublishedProducts(),
    listPublishedBlogPosts(),
    getHomepageSection('features'),
    getHomepageSection('support'),
    listPublishedTestimonials(),
    listPublishedFaqEntries('site'),
    listSeoCourses(),
    listSeoBundles(),
    listSeoProducts(),
  ]);

  const homepageSchema = buildCollectionPageSchema(
    'দেশি কোর্স হোমপেজ',
    'বাংলা online course, bundle, template এবং skill learning collection',
    '/',
    [
      ...seoCourses.slice(0, 6).map((course) => ({
        name: course.title,
        path: `/courses/${course.slug}`,
      })),
      ...seoBundles.slice(0, 2).map((bundle) => ({
        name: bundle.title,
        path: `/bundles/${bundle.slug}`,
      })),
      ...seoProducts.slice(0, 2).map((product) => ({
        name: product.title,
        path: `/products/${product.slug}`,
      })),
      ...posts.slice(0, 3).map((post) => ({
        name: post.title,
        path: `/blog/${post.slug}`,
      })),
    ],
  );

  return (
    <>
      <StructuredData
        data={buildBreadcrumbSchema([{ name: 'হোম', path: '/' }])}
      />
      <StructuredData data={homepageSchema} />
      {siteFaq.length > 0 ? (
        <StructuredData
          data={buildFaqSchema(
            siteFaq.map((entry) => ({
              question: entry.question,
              answer: entry.answer,
            })),
          )}
        />
      ) : null}
      <AnswerBlock
        eyebrow="Platform answer"
        title="দেশি কোর্স কী?"
        answer="দেশি কোর্স একটি বাংলা online learning ও digital resource platform, যেখানে course, bundle, template এবং support channel এক জায়গায় পাওয়া যায়। প্রতিটি offer page থেকে real catalog data, price, access এবং FAQ দেখে সিদ্ধান্ত নেওয়া যায়।"
        points={[
          `${featuredCourses.length} featured course loaded from catalog`,
          `${bundles.length} bundle offer available`,
          'Support: WhatsApp, Messenger, email ও contact form',
        ]}
        ctaHref="/courses"
        ctaLabel="Course catalog দেখুন"
      />
      <Stats />
      <Features sectionData={featureSection} />
      <FeaturedCourses courses={featuredCourses} mobileLimit={4} desktopLimit={3} />
      <BundleShowcaseStatic bundles={bundles} mobileLimit={4} desktopLimit={3} />
      <ProductShowcaseStatic items={products} mobileLimit={4} desktopLimit={3} />
      <Testimonials testimonials={testimonials} />
      <Support
        sectionData={supportSection}
        faqItems={siteFaq.map((entry) => ({
          question: entry.question,
          answer: entry.answer,
        }))}
      />
      <LatestBlog posts={posts} mobileLimit={2} desktopLimit={3} />
      <CTA />
      <Footer />
    </>
  );
}

