import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import Categories from '@/components/Categories';
import FeaturedCourses from '@/components/FeaturedCourses';
import Infographic from '@/components/Infographic';
import ProductShowcase from '@/components/ProductShowcase';
import Testimonials from '@/components/Testimonials';
import Support from '@/components/Support';
import LatestBlog from '@/components/LatestBlog';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import { FEATURED_COURSES } from '@/lib/course-catalog';
import { BLOG_POSTS } from '@/lib/blog-data';
import { BUNDLE_CATALOG } from '@/lib/bundle-catalog';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from '@/lib/seo';
import { SHOP_CATALOG } from '@/lib/shop-catalog';

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

export default function Home() {
  const homepageSchema = buildCollectionPageSchema(
    'দেশি কোর্স হোমপেজ',
    'বাংলা online course, bundle, template এবং skill learning collection',
    '/',
    [
      ...FEATURED_COURSES.slice(0, 6).map((course) => ({
        name: course.title,
        path: `/courses/${course.slug}`,
      })),
      ...BUNDLE_CATALOG.slice(0, 2).map((bundle) => ({
        name: bundle.title,
        path: `/bundles/${bundle.slug}`,
      })),
      ...SHOP_CATALOG.slice(0, 2).map((product) => ({
        name: product.title,
        path: `/templates/${product.slug}`,
      })),
      ...BLOG_POSTS.slice(0, 3).map((post) => ({
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
      <Hero />
      <Stats />
      <Features />
      <Categories />
      <FeaturedCourses mobileLimit={4} desktopLimit={3} />
      <Infographic mobileLimit={4} desktopLimit={3} />
      <ProductShowcase mobileLimit={4} desktopLimit={3} />
      <Testimonials />
      <Support />
      <LatestBlog mobileLimit={2} desktopLimit={3} />
      <CTA />
      <Footer />
    </main>
  );
}
