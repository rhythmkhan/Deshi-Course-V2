import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import FeaturedCourses from '@/components/FeaturedCourses';
import Infographic from '@/components/Infographic';
import ProductShowcase from '@/components/ProductShowcase';
import Testimonials from '@/components/Testimonials';
import Support from '@/components/Support';
import LatestBlog from '@/components/LatestBlog';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import {
  getHomepageSection,
  listActiveAnnouncementBanners,
  listFeaturedCourses,
  listPublishedFaqEntries,
  listPublishedBlogPosts,
  listPublishedBundles,
  listPublishedProducts,
  listPublishedTestimonials,
} from '@/lib/content-store';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
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

export const revalidate = 86400;

export default async function Home() {
  const [
    featuredCourses,
    bundles,
    products,
    posts,
    heroSection,
    featureSection,
    supportSection,
    testimonials,
    siteFaq,
    banners,
  ] = await Promise.all([
    listFeaturedCourses(),
    listPublishedBundles(),
    listPublishedProducts(),
    listPublishedBlogPosts(),
    getHomepageSection('hero'),
    getHomepageSection('features'),
    getHomepageSection('support'),
    listPublishedTestimonials(),
    listPublishedFaqEntries('site'),
    listActiveAnnouncementBanners(),
  ]);

  const homepageSchema = buildCollectionPageSchema(
    'দেশি কোর্স হোমপেজ',
    'বাংলা online course, bundle, template এবং skill learning collection',
    '/',
    [
      ...featuredCourses.slice(0, 6).map((course) => ({
        name: course.title,
        path: `/courses/${course.slug}`,
      })),
      ...bundles.slice(0, 2).map((bundle) => ({
        name: bundle.title,
        path: `/bundles/${bundle.slug}`,
      })),
      ...products.slice(0, 2).map((product) => ({
        name: product.title,
        path: `/templates/${product.slug}`,
      })),
      ...posts.slice(0, 3).map((post) => ({
        name: post.title,
        path: `/blog/${post.slug}`,
      })),
    ],
  );

  return (
    <main className="min-h-screen">
      <StructuredData
        data={buildBreadcrumbSchema([{ name: 'হোম', path: '/' }])}
      />
      <StructuredData data={homepageSchema} />
      <Navbar />
      {banners.length > 0 ? (
        <section className="border-b border-brand/10 bg-brand/5 px-4 py-3 text-center text-sm text-brand">
          <span className="font-semibold">{banners[0].title}</span>
          {banners[0].body ? <span className="ml-2 text-gray-600">{banners[0].body}</span> : null}
        </section>
      ) : null}
      <Hero sectionData={heroSection} />
      <Stats />
      <Features sectionData={featureSection} />
      <FeaturedCourses courses={featuredCourses} mobileLimit={4} desktopLimit={3} />
      <Infographic bundles={bundles} mobileLimit={4} desktopLimit={3} />
      <ProductShowcase items={products} mobileLimit={4} desktopLimit={3} />
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
    </main>
  );
}
