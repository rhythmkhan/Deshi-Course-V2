import {
  BLOG_POSTS,
  type BlogPost,
} from '@/lib/blog-data';
import { BUNDLE_CATALOG, type BundleItem } from '@/lib/bundle-catalog';
import { getBundleDetailBySlug } from '@/lib/bundle-details';
import {
  COURSE_CATALOG,
  FEATURED_COURSES,
  type CourseSummary,
} from '@/lib/course-catalog';
import { type CourseDetail, getCourseBySlug } from '@/lib/course-details';
import { FAQ_ITEMS } from '@/lib/faq-data';
import { sanitizeRichHtml } from '@/lib/html-sanitize';
import { getProductDetailBySlug } from '@/lib/product-details';
import { SHOP_CATALOG, type ShopItem } from '@/lib/shop-catalog';
import {
  bundleToSeoEntity,
  clampSeoDescription,
  courseToSeoEntity,
  deriveSeoCategories,
  getSeoRiskReason,
  productToSeoEntity,
  templatePath,
  type SeoCategory,
} from '@/lib/seo-catalog';
import {
  fetchSheetCourseContent,
  fetchSheetMixedContent,
  getTelegramCoursePreviewImage,
  normalizeCatalogPrice,
  type SheetCourseContent,
} from '@/lib/catalog-sync';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  ManagedAnnouncementBanner,
  ManagedBlogPost,
  ManagedBundle,
  ManagedCourse,
  ManagedFaqEntry,
  ManagedHomepageSection,
  ManagedProduct,
  ManagedTestimonial,
  SiteSettingRecord,
} from '@/lib/content-types';

interface GenericRow {
  [key: string]: unknown;
}

interface PublicBundleDetail extends BundleItem {
  overview: string;
  deliverables: string[];
  audience: string[];
  workflow: string[];
  faq: Array<{ question: string; answer: string }>;
  support: string;
  facts: Array<{ label: string; value: string }>;
  includedCourses: CourseSummary[];
}

interface PublicProductDetail extends ShopItem {
  overview: string;
  deliverables: string[];
  useCases: string[];
  audience: string[];
  workflow: string[];
  faq: Array<{ question: string; answer: string }>;
  support: string;
  facts: Array<{ label: string; value: string }>;
}

const PUBLIC_CONTENT_REVALIDATE = 60 * 60;
const ACTIVE_BANNER_REVALIDATE = 60 * 5;

function withPublicContentCache<T>(
  key: string,
  loader: () => Promise<T>,
  revalidate = PUBLIC_CONTENT_REVALIDATE,
) {
  return unstable_cache(loader, [`content-store:${key}`], { revalidate });
}

const FALLBACK_HOMEPAGE_SECTIONS: ManagedHomepageSection[] = [
  {
    id: 'fallback-home-hero',
    sectionKey: 'hero',
    title: 'দক্ষতা অর্জন করুন। কাগজ নয়!',
    subtitle:
      'ইন-ডিমান্ড স্কিল শিখে আগামীর ক্যারিয়ার গড়ুন। ২,০০০+ শিক্ষার্থীর ভরসার platform।',
    body: {
      primaryCtaLabel: 'এখনই শুরু করুন',
      primaryCtaHref: '/signin',
      secondaryCtaLabel: 'কোর্স দেখুন',
      secondaryCtaHref: '/courses',
      image: '/hero.webp',
    },
    isPublished: true,
    sortOrder: 0,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: 'fallback-home-features',
    sectionKey: 'features',
    title: 'আমাদের কোর্স থেকে কেন শিখবেন?',
    subtitle:
      'মানসম্পন্ন শিক্ষা এবং ব্যবহারিক দক্ষতার ওপর জোর দিয়ে career-ready learning experience।',
    body: {
      items: [
        {
          id: '01',
          title: 'শিখুন',
          description:
            'ইন-ডিমান্ড স্কিল শিখুন বাস্তব উদাহরণ, প্রজেক্ট এবং guided support-এর মাধ্যমে।',
        },
        {
          id: '02',
          title: 'প্র্যাকটিক্যাল করুন',
          description:
            'প্র্যাকটিক্যাল কাজের মাধ্যমে শেখাকে শক্ত করুন এবং বাস্তব সমস্যার সমাধান করতে শিখুন।',
        },
        {
          id: '03',
          title: 'ক্যারিয়ার গড়ুন',
          description:
            'দক্ষতাকে কাজে লাগিয়ে আয়, সুযোগ এবং দীর্ঘমেয়াদি ক্যারিয়ারের ভিত্তি তৈরি করুন।',
        },
      ],
    },
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: 'fallback-home-support',
    sectionKey: 'support',
    title: 'আপনার কি কোনো সাহায্য প্রয়োজন?',
    subtitle: 'আমাদের support team সবসময় পাশে আছে।',
    body: {
      contactMethods: [
        {
          title: 'সরাসরি WhatsApp-এ মেসেজ করুন',
          description:
            'সকাল ১০টা থেকে রাত ৮টা পর্যন্ত WhatsApp support।',
          contact: '+৮৮০ ১৮১৩ ৮৯৬৪০০',
          action: 'মেসেজ করুন',
          href: 'https://wa.me/8801813896400',
          theme: 'whatsapp',
        },
        {
          title: 'লাইভ চ্যাট',
          description:
            'Messenger-এ সরাসরি support নিন।',
          contact: 'Messenger support',
          action: 'চ্যাট শুরু করুন',
          href: 'https://www.messenger.com/t/956128257564286',
          theme: 'messenger',
        },
        {
          title: 'ইমেইল সাপোর্ট',
          description:
            'বিস্তারিত সমস্যার জন্য email support।',
          contact: 'info@deshicourse.xyz',
          action: 'ইমেইল পাঠান',
          href: 'mailto:info@deshicourse.xyz',
          theme: 'email',
        },
      ],
    },
    isPublished: true,
    sortOrder: 2,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];

const FALLBACK_TESTIMONIALS: ManagedTestimonial[] = [
  {
    id: 'fallback-testimonial-1',
    quote:
      'শিক্ষকদের industry experience আর বাস্তব project flow complex ধারণাগুলো অনেক সহজ করে দিয়েছে।',
    name: 'সারা চেন',
    role: 'সিইও, লেটস কানেক্ট',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    rating: 5,
    isPublished: true,
    sortOrder: 0,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: 'fallback-testimonial-2',
    quote:
      'Practical content আর support আমাকে real-world challenge handle করতে confidence দিয়েছে।',
    name: 'জেনিফার ওয়ালশ',
    role: 'ম্যানেজার, লেটস কানেক্ট',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    rating: 5,
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];

const FALLBACK_FAQ_ENTRIES: ManagedFaqEntry[] = FAQ_ITEMS.map((item, index) => ({
  id: `fallback-faq-${index + 1}`,
  scope: 'site',
  scopeSlug: null,
  question: item.question,
  answer: item.answer,
  sortOrder: index,
  isPublished: true,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
}));

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function toString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function toNullableString(value: unknown) {
  const text = toString(value);
  return text || null;
}

function toBoolean(value: unknown) {
  return value === true;
}

function toObject(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function toFactArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((entry) => {
          const record = toObject(entry);
          const label = toString(record.label);
          const itemValue = toString(record.value);
          if (!label || !itemValue) {
            return null;
          }

          return {
            label,
            value: itemValue,
          };
        })
        .filter(
          (entry): entry is { label: string; value: string } => Boolean(entry),
        )
    : [];
}

function toFaqArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((entry) => {
          const record = toObject(entry);
          const question = toString(record.question);
          const answer = toString(record.answer);
          if (!question || !answer) {
            return null;
          }

          return {
            question,
            answer,
          };
        })
        .filter(
          (entry): entry is { question: string; answer: string } => Boolean(entry),
        )
    : [];
}

function toModuleArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((entry) => {
          const record = toObject(entry);
          const title = toString(record.title);
          const lessons = toStringArray(record.lessons);

          if (!title || lessons.length === 0) {
            return null;
          }

          return {
            title,
            lessons,
          };
        })
        .filter(
          (
            entry,
          ): entry is {
            title: string;
            lessons: string[];
          } => Boolean(entry),
        )
    : [];
}

function toManagedCourse(row: GenericRow): ManagedCourse {
  return {
    id: toString(row.id),
    legacyId: row.legacy_id === null ? null : toNumber(row.legacy_id),
    slug: toString(row.slug),
    title: toString(row.title),
    category: toString(row.category),
    level: (toString(row.level) as ManagedCourse['level']) || 'beginner',
    price: toNumber(row.price),
    originalPrice: toNumber(row.original_price),
    image: toString(row.image),
    instructor: toString(row.instructor),
    accessLabel: toString(row.access_label),
    tag: toString(row.tag),
    promoTag: toNullableString(row.promo_tag),
    featureMetrics: toStringArray(row.feature_metrics),
    shortDescription: toString(row.short_description),
    detailContent: toObject(row.detail_content),
    gallery: toStringArray(row.gallery),
    seoTitle: toNullableString(row.seo_title),
    seoDescription: toNullableString(row.seo_description),
    badgeLabel: toNullableString(row.badge_label),
    supportText: toNullableString(row.support_text),
    accessDurationDays:
      row.access_duration_days === null || row.access_duration_days === undefined
        ? null
        : toNumber(row.access_duration_days),
    visibility: (toString(row.visibility) as ManagedCourse['visibility']) || 'public',
    metadata: toObject(row.metadata),
    isPublished: toBoolean(row.is_published),
    isFeatured: toBoolean(row.is_featured),
    sortOrder: toNumber(row.sort_order),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toManagedBundle(row: GenericRow): ManagedBundle {
  const bundleItems = Array.isArray(row.bundle_items)
    ? (row.bundle_items as Array<Record<string, unknown>>)
    : [];

  return {
    id: toString(row.id),
    legacyId: row.legacy_id === null ? null : toNumber(row.legacy_id),
    slug: toString(row.slug),
    title: toString(row.title),
    subtitle: toString(row.subtitle),
    image: toString(row.image),
    bundlePrice: toNumber(row.bundle_price),
    originalPrice: toNumber(row.original_price),
    accessLabel: toString(row.access_label),
    highlight: toString(row.highlight),
    featureMetrics: toStringArray(row.feature_metrics),
    includedCourseSlugs: bundleItems
      .sort((a, b) => toNumber(a.sort_order) - toNumber(b.sort_order))
      .map((item) => toString(item.course_slug))
      .filter(Boolean),
    shortDescription: toString(row.short_description),
    detailContent: toObject(row.detail_content),
    gallery: toStringArray(row.gallery),
    seoTitle: toNullableString(row.seo_title),
    seoDescription: toNullableString(row.seo_description),
    badgeLabel: toNullableString(row.badge_label),
    supportText: toNullableString(row.support_text),
    visibility: (toString(row.visibility) as ManagedBundle['visibility']) || 'public',
    metadata: toObject(row.metadata),
    tag: toNullableString(row.tag),
    isPublished: toBoolean(row.is_published),
    isFeatured: toBoolean(row.is_featured),
    sortOrder: toNumber(row.sort_order),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toManagedProduct(row: GenericRow): ManagedProduct {
  return {
    id: toString(row.id),
    legacyId: row.legacy_id === null ? null : toNumber(row.legacy_id),
    slug: toString(row.slug),
    title: toString(row.title),
    type: toString(row.type),
    image: toString(row.image),
    price: toNumber(row.price),
    description: toString(row.description),
    format: toString(row.format),
    accessLabel: toString(row.access_label),
    featureMetrics: toStringArray(row.feature_metrics),
    shortDescription: toString(row.short_description),
    detailContent: toObject(row.detail_content),
    gallery: toStringArray(row.gallery),
    seoTitle: toNullableString(row.seo_title),
    seoDescription: toNullableString(row.seo_description),
    badgeLabel: toNullableString(row.badge_label),
    supportText: toNullableString(row.support_text),
    accessDurationDays:
      row.access_duration_days === null || row.access_duration_days === undefined
        ? null
        : toNumber(row.access_duration_days),
    visibility: (toString(row.visibility) as ManagedProduct['visibility']) || 'public',
    metadata: toObject(row.metadata),
    tag: toNullableString(row.tag),
    isPublished: toBoolean(row.is_published),
    isFeatured: toBoolean(row.is_featured),
    sortOrder: toNumber(row.sort_order),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toManagedBlogPost(row: GenericRow): ManagedBlogPost {
  return {
    id: toString(row.id),
    legacyId: toNullableString(row.legacy_id),
    slug: toString(row.slug),
    title: toString(row.title),
    excerpt: toString(row.excerpt),
    content: sanitizeRichHtml(toString(row.content)),
    author: toString(row.author),
    displayDate: toString(row.display_date),
    publishedAt: toNullableString(row.published_at),
    image: toString(row.image),
    category: toString(row.category),
    tags: toStringArray(row.tags),
    seoTitle: toNullableString(row.seo_title),
    seoDescription: toNullableString(row.seo_description),
    metadata: toObject(row.metadata),
    isPublished: toBoolean(row.is_published),
    isFeatured: toBoolean(row.is_featured),
    sortOrder: toNumber(row.sort_order),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toManagedFaqEntry(row: GenericRow): ManagedFaqEntry {
  return {
    id: toString(row.id),
    scope: (toString(row.scope) as ManagedFaqEntry['scope']) || 'site',
    scopeSlug: toNullableString(row.scope_slug),
    question: toString(row.question),
    answer: toString(row.answer),
    sortOrder: toNumber(row.sort_order),
    isPublished: toBoolean(row.is_published),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toManagedHomepageSection(row: GenericRow): ManagedHomepageSection {
  return {
    id: toString(row.id),
    sectionKey: toString(row.section_key),
    title: toNullableString(row.title),
    subtitle: toNullableString(row.subtitle),
    body: toObject(row.body),
    isPublished: toBoolean(row.is_published),
    sortOrder: toNumber(row.sort_order),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toManagedTestimonial(row: GenericRow): ManagedTestimonial {
  return {
    id: toString(row.id),
    quote: toString(row.quote),
    name: toString(row.name),
    role: toString(row.role),
    avatarUrl: toNullableString(row.avatar_url),
    rating: toNumber(row.rating),
    isPublished: toBoolean(row.is_published),
    sortOrder: toNumber(row.sort_order),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toManagedAnnouncementBanner(row: GenericRow): ManagedAnnouncementBanner {
  return {
    id: toString(row.id),
    title: toString(row.title),
    body: toString(row.body),
    ctaLabel: toNullableString(row.cta_label),
    ctaHref: toNullableString(row.cta_href),
    theme: toString(row.theme),
    isActive: toBoolean(row.is_active),
    sortOrder: toNumber(row.sort_order),
    startsAt: toNullableString(row.starts_at),
    endsAt: toNullableString(row.ends_at),
    createdAt: toString(row.created_at),
    updatedAt: toString(row.updated_at),
  };
}

function toCourseSummary(course: ManagedCourse): CourseSummary {
  return {
    id: course.legacyId ?? course.sortOrder + 1,
    slug: course.slug,
    title: course.title,
    category: course.category,
    level: course.level,
    price: course.price,
    originalPrice: course.originalPrice,
    image: course.image,
    instructor: course.instructor,
    accessLabel: course.accessLabel,
    tag: course.tag,
    promoTag: course.promoTag ?? undefined,
    seoTitle: course.seoTitle,
    seoDescription: course.seoDescription,
    featureMetrics: course.featureMetrics,
    isOwned: false,
    progress: 0,
  };
}

function slugifyCourseTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function courseSheetToSummary(item: SheetCourseContent): CourseSummary {
  return {
    id: item.sourceRow,
    slug: item.slug,
    title: item.title,
    category: 'শীট থেকে কোর্স',
    level: 'beginner',
    price: item.price,
    originalPrice: item.price,
    image: item.image || '/images/courses/n8n-automation-mastery.webp',
    instructor: 'দেশি কোর্স',
    accessLabel: 'Lifetime access',
    tag: 'নতুন',
    promoTag: undefined,
    featureMetrics: [
      'Lifetime access, কোনো monthly fee নাই',
      'Instant dashboard access',
      'Telegram preview image available',
    ],
    isOwned: false,
    progress: 0,
  };
}

function getSheetSummarySnippet(rawText: string, fallback: string) {
  const candidates = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((line) => !/^course name\s*:?\s*/i.test(line))
    .filter((line) => !/^download link/i.test(line))
    .filter((line) => !/^https?:\/\//i.test(line))
    .filter((line) => !/^➡️?\s*https?:\/\//i.test(line));

  return candidates[0] || fallback;
}

function sheetBundleToSummary(item: SheetCourseContent): BundleItem {
  const subtitle = getSheetSummarySnippet(
    item.rawText,
    `${item.title} bundle-এর মধ্যে multiple resource/combo access আছে।`,
  );

  return {
    id: item.sourceRow,
    slug: item.slug,
    title: item.title,
    subtitle,
    image: item.image || '/images/courses/n8n-automation-mastery.webp',
    bundlePrice: normalizeCatalogPrice(item.price),
    originalPrice: normalizeCatalogPrice(item.price),
    accessLabel: 'Instant access',
    highlight: 'Sheet synced bundle',
    includedCourseSlugs: [],
    featureMetrics: [
      'Bundle/combo resource access',
      'Instant dashboard or download access',
      'Telegram preview image synced',
    ],
    tag: 'নতুন',
  };
}

function sheetProductToSummary(item: SheetCourseContent): ShopItem {
  return {
    id: item.sourceRow,
    slug: item.slug,
    title: item.title,
    type: 'ডিজিটাল প্রোডাক্ট',
    image: item.image || '/images/courses/n8n-automation-mastery.webp',
    price: normalizeCatalogPrice(item.price),
    description: getSheetSummarySnippet(
      item.rawText,
      `${item.title} ready-made digital resource হিসেবে instant access এর জন্য রাখা হয়েছে।`,
    ),
    format: 'Instant digital access',
    accessLabel: 'Lifetime access',
    featureMetrics: [
      'Instant digital access',
      'One-time purchase resource',
      'Telegram preview image synced',
    ],
    tag: 'নতুন',
  };
}

function dedupeCourseSummaries(courses: CourseSummary[]) {
  const courseBySlug = new Map<string, CourseSummary>();

  for (const course of courses) {
    courseBySlug.set(course.slug, course);
  }

  return [...courseBySlug.values()];
}

function dedupeBundleSummaries(bundles: BundleItem[]) {
  const bundleBySlug = new Map<string, BundleItem>();

  for (const bundle of bundles) {
    bundleBySlug.set(bundle.slug, bundle);
  }

  return [...bundleBySlug.values()];
}

function dedupeProductSummaries(products: ShopItem[]) {
  const productBySlug = new Map<string, ShopItem>();

  for (const product of products) {
    productBySlug.set(product.slug, product);
  }

  return [...productBySlug.values()];
}

function courseSheetToDetail(item: SheetCourseContent, fallback: CourseDetail | null) {
  const title = item.title || fallback?.title || 'Course';
  const image = item.image || fallback?.image || '/images/courses/n8n-automation-mastery.webp';
  const primaryLink = item.primaryLink || '';
  const rawText = item.rawText || '';
  const base = fallback ?? {
    ...courseSheetToSummary(item),
    language: 'বাংলা',
    heroSummary: rawText || title,
    description: rawText || title,
    outcomeSummary: 'Sheet থেকে sync করা course.',
    deliverables: ['Lifetime access'],
    audience: ['Learner'],
    workflow: ['Purchase করুন', 'Access নিন'],
    tools: ['Telegram', 'Google Sheets'],
    support: 'Sheet sync support.',
    facts: [
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'Source', value: 'Google Sheet' },
    ],
    faq: [],
  };

  return {
    ...base,
    title,
    slug: item.slug,
    image,
    price: item.price || base.price,
    originalPrice: item.price || base.originalPrice,
    heroSummary: rawText || base.heroSummary,
    description: rawText || base.description,
    outcomeSummary: rawText || base.outcomeSummary,
    support: base.support,
    facts: [
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'Source', value: 'Google Sheet' },
      ...(item.primaryLink ? [{ label: 'Primary link', value: 'Available' }] : []),
    ],
  } satisfies CourseDetail;
}

function toBundleSummary(bundle: ManagedBundle): BundleItem {
  return {
    id: bundle.legacyId ?? bundle.sortOrder + 1,
    slug: bundle.slug,
    title: bundle.title,
    subtitle: bundle.subtitle,
    image: bundle.image,
    bundlePrice: bundle.bundlePrice,
    originalPrice: bundle.originalPrice,
    accessLabel: bundle.accessLabel,
    highlight: bundle.highlight,
    includedCourseSlugs: bundle.includedCourseSlugs,
    seoTitle: bundle.seoTitle,
    seoDescription: bundle.seoDescription,
    featureMetrics: bundle.featureMetrics,
    tag: bundle.tag ?? undefined,
  };
}

function toProductSummary(product: ManagedProduct): ShopItem {
  return {
    id: product.legacyId ?? product.sortOrder + 1,
    slug: product.slug,
    title: product.title,
    type: product.type,
    image: product.image,
    price: product.price,
    description: product.description,
    format: product.format,
    accessLabel: product.accessLabel,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    featureMetrics: product.featureMetrics,
    tag: product.tag ?? undefined,
  };
}

function applySheetBundleOverrides(bundle: BundleItem, item?: Pick<SheetCourseContent, 'slug' | 'title' | 'price' | 'image'>) {
  if (!item) return bundle;
  return {
    ...bundle,
    slug: item.slug || bundle.slug,
    title: item.title || bundle.title,
    bundlePrice: normalizeCatalogPrice(item.price || bundle.bundlePrice),
    originalPrice: normalizeCatalogPrice(item.price || bundle.originalPrice),
    image: item.image || bundle.image,
  };
}

function applySheetProductOverrides(product: ShopItem, item?: Pick<SheetCourseContent, 'slug' | 'title' | 'price' | 'image'>) {
  if (!item) return product;
  return {
    ...product,
    slug: item.slug || product.slug,
    title: item.title || product.title,
    price: normalizeCatalogPrice(item.price || product.price),
    image: item.image || product.image,
  };
}

function toPublicBlogPost(post: ManagedBlogPost): BlogPost {
  return {
    id: post.legacyId ?? post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    date: post.displayDate,
    image: post.image,
    category: post.category,
    tags: post.tags,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
  };
}

function canUseAdminContent() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SECRET_KEY,
  );
}

async function safeTableQuery<T>(
  loader: () => Promise<T>,
  fallback: T,
) {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

async function loadTable<T>(
  table: string,
  mapper: (row: GenericRow) => T,
  options?: {
    select?: string;
    orderBy?: string;
  },
) {
  const supabase = createAdminClient();
  let query = supabase
    .from(table)
    .select(options?.select ?? '*');

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: true });
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return [] as T[];
  }

  return (data as unknown as GenericRow[]).map(mapper);
}

async function legacyCourses(): Promise<ManagedCourse[]> {
  return COURSE_CATALOG.map((course, index) => ({
    id: `legacy-course-${course.slug}`,
    legacyId: course.id,
    slug: course.slug,
    title: course.title,
    category: course.category,
    level: course.level,
    price: course.price,
    originalPrice: course.originalPrice,
    image: course.image,
    instructor: course.instructor,
    accessLabel: course.accessLabel,
    tag: course.tag,
    promoTag: course.promoTag ?? null,
    featureMetrics: course.featureMetrics,
    shortDescription: getCourseBySlug(course.slug)?.heroSummary ?? '',
    detailContent: {},
    gallery: [course.image],
    seoTitle: null,
    seoDescription: null,
    badgeLabel: null,
    supportText: getCourseBySlug(course.slug)?.support ?? null,
    accessDurationDays: null,
    visibility: 'public',
    metadata: {},
    isPublished: true,
    isFeatured: FEATURED_COURSES.some((entry) => entry.slug === course.slug),
    sortOrder: index,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }));
}

async function legacyBundles(): Promise<ManagedBundle[]> {
  return BUNDLE_CATALOG.map((bundle, index) => ({
    id: `legacy-bundle-${bundle.slug}`,
    legacyId: bundle.id,
    slug: bundle.slug,
    title: bundle.title,
    subtitle: bundle.subtitle,
    image: bundle.image,
    bundlePrice: bundle.bundlePrice,
    originalPrice: bundle.originalPrice,
    accessLabel: bundle.accessLabel,
    highlight: bundle.highlight,
    featureMetrics: bundle.featureMetrics,
    includedCourseSlugs: bundle.includedCourseSlugs,
    shortDescription: getBundleDetailBySlug(bundle.slug)?.overview ?? '',
    detailContent: {},
    gallery: [bundle.image],
    seoTitle: null,
    seoDescription: null,
    badgeLabel: null,
    supportText: getBundleDetailBySlug(bundle.slug)?.support ?? null,
    visibility: 'public',
    metadata: {},
    tag: bundle.tag ?? null,
    isPublished: true,
    isFeatured: index < 2,
    sortOrder: index,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }));
}

async function legacyProducts(): Promise<ManagedProduct[]> {
  return SHOP_CATALOG.map((product, index) => ({
    id: `legacy-product-${product.slug}`,
    legacyId: product.id,
    slug: product.slug,
    title: product.title,
    type: product.type,
    image: product.image,
    price: product.price,
    description: product.description,
    format: product.format,
    accessLabel: product.accessLabel,
    featureMetrics: product.featureMetrics,
    shortDescription: getProductDetailBySlug(product.slug)?.overview ?? '',
    detailContent: {},
    gallery: [product.image],
    seoTitle: null,
    seoDescription: null,
    badgeLabel: null,
    supportText: getProductDetailBySlug(product.slug)?.support ?? null,
    accessDurationDays: null,
    visibility: 'public',
    metadata: {},
    tag: product.tag ?? null,
    isPublished: true,
    isFeatured: index < 2,
    sortOrder: index,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }));
}

async function legacyBlogPosts(): Promise<ManagedBlogPost[]> {
  return BLOG_POSTS.map((post, index) => ({
    id: `legacy-blog-${post.slug}`,
    legacyId: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: sanitizeRichHtml(post.content),
    author: post.author,
    displayDate: post.date,
    publishedAt: null,
    image: post.image,
    category: post.category,
    tags: post.tags,
    seoTitle: null,
    seoDescription: null,
    metadata: {},
    isPublished: true,
    isFeatured: index < 3,
    sortOrder: index,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }));
}

const readManagedCourses = withPublicContentCache('managed-courses', async () => {
  if (!canUseAdminContent()) {
    return legacyCourses();
  }

  const rows = await safeTableQuery(
    () =>
      loadTable(
        'courses',
        toManagedCourse,
        { select: '*', orderBy: 'sort_order' },
      ),
    [] as ManagedCourse[],
  );

  return rows.length > 0 ? rows : legacyCourses();
});

export const listManagedCourses = cache(async function listManagedCourses() {
  return readManagedCourses();
});

const readManagedBundles = withPublicContentCache('managed-bundles', async () => {
  if (!canUseAdminContent()) {
    return legacyBundles();
  }

  const rows = await safeTableQuery(
    () =>
      loadTable(
        'bundles',
        toManagedBundle,
        {
          select: '*, bundle_items(course_slug, sort_order)',
          orderBy: 'sort_order',
        },
      ),
    [] as ManagedBundle[],
  );

  return rows.length > 0 ? rows : legacyBundles();
});

export const listManagedBundles = cache(async function listManagedBundles() {
  return readManagedBundles();
});

const readManagedProducts = withPublicContentCache('managed-products', async () => {
  if (!canUseAdminContent()) {
    return legacyProducts();
  }

  const rows = await safeTableQuery(
    () =>
      loadTable(
        'products',
        toManagedProduct,
        { select: '*', orderBy: 'sort_order' },
      ),
    [] as ManagedProduct[],
  );

  return rows.length > 0 ? rows : legacyProducts();
});

export const listManagedProducts = cache(async function listManagedProducts() {
  return readManagedProducts();
});

const readManagedBlogPosts = withPublicContentCache('managed-blog-posts', async () => {
  if (!canUseAdminContent()) {
    return legacyBlogPosts();
  }

  const rows = await safeTableQuery(
    () =>
      loadTable(
        'blog_posts',
        toManagedBlogPost,
        { select: '*', orderBy: 'sort_order' },
      ),
    [] as ManagedBlogPost[],
  );

  return rows.length > 0 ? rows : legacyBlogPosts();
});

export const listManagedBlogPosts = cache(async function listManagedBlogPosts() {
  return readManagedBlogPosts();
});

export async function listSiteSettings() {
  if (!canUseAdminContent()) {
    return [] as SiteSettingRecord[];
  }

  return safeTableQuery(async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value, updated_at')
      .order('setting_key', { ascending: true });

    if (error || !data) {
      return [] as SiteSettingRecord[];
    }

    return (data as Array<Record<string, unknown>>).map((row) => ({
      key: toString(row.setting_key),
      value: row.setting_value,
      updatedAt: toString(row.updated_at),
    }));
  }, [] as SiteSettingRecord[]);
}

const readManagedFaqEntries = withPublicContentCache('managed-faq-entries', async () => {
  if (!canUseAdminContent()) {
    return FALLBACK_FAQ_ENTRIES;
  }

  const rows = await safeTableQuery(
    () =>
      loadTable(
        'faq_entries',
        toManagedFaqEntry,
        { select: '*', orderBy: 'sort_order' },
      ),
    [] as ManagedFaqEntry[],
  );

  return rows.length > 0 ? rows : FALLBACK_FAQ_ENTRIES;
});

export async function listManagedFaqEntries(
  scope?: ManagedFaqEntry['scope'],
  scopeSlug?: string,
) {
  return (await readManagedFaqEntries()).filter((entry) =>
    (!scope || entry.scope === scope) &&
    (!scopeSlug || entry.scopeSlug === scopeSlug),
  );
}

export const listPublishedFaqEntries = cache(async function listPublishedFaqEntries(
  scope?: ManagedFaqEntry['scope'],
  scopeSlug?: string,
) {
  return (await listManagedFaqEntries(scope, scopeSlug))
    .filter((entry) => entry.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
});

const readManagedHomepageSections = withPublicContentCache('managed-homepage-sections', async () => {
  if (!canUseAdminContent()) {
    return FALLBACK_HOMEPAGE_SECTIONS;
  }

  const rows = await safeTableQuery(
    () =>
      loadTable(
        'homepage_sections',
        toManagedHomepageSection,
        { select: '*', orderBy: 'sort_order' },
      ),
    [] as ManagedHomepageSection[],
  );

  return rows.length > 0 ? rows : FALLBACK_HOMEPAGE_SECTIONS;
});

export const listManagedHomepageSections = cache(async function listManagedHomepageSections() {
  return readManagedHomepageSections();
});

export const getHomepageSection = cache(async function getHomepageSection(sectionKey: string) {
  return (await listManagedHomepageSections()).find(
    (section) => section.sectionKey === sectionKey && section.isPublished,
  ) ?? null;
});

const readManagedTestimonials = withPublicContentCache('managed-testimonials', async () => {
  if (!canUseAdminContent()) {
    return FALLBACK_TESTIMONIALS;
  }

  const rows = await safeTableQuery(
    () =>
      loadTable(
        'testimonials',
        toManagedTestimonial,
        { select: '*', orderBy: 'sort_order' },
      ),
    [] as ManagedTestimonial[],
  );

  return rows.length > 0 ? rows : FALLBACK_TESTIMONIALS;
});

export const listManagedTestimonials = cache(async function listManagedTestimonials() {
  return readManagedTestimonials();
});

export const listPublishedTestimonials = cache(async function listPublishedTestimonials() {
  return (await listManagedTestimonials())
    .filter((entry) => entry.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
});

const readManagedAnnouncementBanners = withPublicContentCache(
  'managed-announcement-banners',
  async () => {
    if (!canUseAdminContent()) {
      return [] as ManagedAnnouncementBanner[];
    }

    return safeTableQuery(
      () =>
        loadTable(
          'announcement_banners',
          toManagedAnnouncementBanner,
          { select: '*', orderBy: 'sort_order' },
        ),
      [] as ManagedAnnouncementBanner[],
    );
  },
  ACTIVE_BANNER_REVALIDATE,
);

export const listManagedAnnouncementBanners = cache(async function listManagedAnnouncementBanners() {
  return readManagedAnnouncementBanners();
});

const readActiveAnnouncementBanners = withPublicContentCache(
  'active-announcement-banners',
  async () => {
    const now = Date.now();
    return (await readManagedAnnouncementBanners()).filter((banner) => {
      const startsAt = banner.startsAt ? new Date(banner.startsAt).getTime() : null;
      const endsAt = banner.endsAt ? new Date(banner.endsAt).getTime() : null;

      return (
        banner.isActive &&
        (startsAt === null || startsAt <= now) &&
        (endsAt === null || endsAt >= now)
      );
    });
  },
  ACTIVE_BANNER_REVALIDATE,
);

export const listActiveAnnouncementBanners = cache(async function listActiveAnnouncementBanners() {
  return readActiveAnnouncementBanners();
});


export const listPublishedCourses = cache(async function listPublishedCourses() {
  const [sheetContent, rows] = await Promise.all([
    fetchSheetCourseContent().catch(() => []),
    listManagedCourses(),
  ]);

  const sheetSummaries = sheetContent.map(courseSheetToSummary);

  return dedupeCourseSummaries([
    ...rows
    .filter((course) => course.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toCourseSummary),
    ...sheetSummaries.filter(
      (item) => !rows.some((course) => slugifyCourseTitle(course.title) === item.slug),
    ),
  ]);
});

export async function getPublishedCourseBySlug(slug: string) {
  const [sheetContent, rows] = await Promise.all([
    fetchSheetCourseContent().catch(() => []),
    listManagedCourses(),
  ]);
  const course = rows.find(
    (entry) => entry.slug === slug && entry.isPublished,
  );
  const sheetCourse = sheetContent.find((item) => item.slug === slug);
  if (sheetCourse) {
    return courseSheetToSummary(sheetCourse);
  }
  return course ? toCourseSummary(course) : null;
}

export const listFeaturedCourses = cache(async function listFeaturedCourses() {
  return (await listManagedCourses())
    .filter((course) => course.isPublished && course.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toCourseSummary);
});

export const listPublishedBundles = cache(async function listPublishedBundles() {
  const [sheetItems, rows] = await Promise.all([
    fetchSheetMixedContent().catch(() => []),
    listManagedBundles(),
  ]);
  const bundleItems = sheetItems.filter((item) => item.type === 'bundle');
  const itemBySlug = new Map(
    bundleItems.map((item) => [item.slug, item]),
  );

  return dedupeBundleSummaries([
    ...rows
      .filter((bundle) => bundle.isPublished)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toBundleSummary)
      .map((bundle) => applySheetBundleOverrides(bundle, itemBySlug.get(bundle.slug))),
    ...bundleItems
      .filter((item) => !rows.some((bundle) => bundle.slug === item.slug || slugifyCourseTitle(bundle.title) === item.slug))
      .map(sheetBundleToSummary),
  ]);
});

export async function getPublishedBundleBySlug(slug: string) {
  const [sheetItems, rows] = await Promise.all([
    fetchSheetMixedContent().catch(() => []),
    listManagedBundles(),
  ]);
  const sheetItem = sheetItems.find((item) => item.type === 'bundle' && item.slug === slug);
  const bundle = rows.find(
    (entry) => entry.slug === slug && entry.isPublished,
  );
  if (bundle) {
    return applySheetBundleOverrides(toBundleSummary(bundle), sheetItem);
  }

  return sheetItem ? sheetBundleToSummary(sheetItem) : null;
}

export const listPublishedProducts = cache(async function listPublishedProducts() {
  const [sheetItems, rows] = await Promise.all([
    fetchSheetMixedContent().catch(() => []),
    listManagedProducts(),
  ]);
  const productItems = sheetItems.filter((item) => item.type === 'product');
  const itemBySlug = new Map(
    productItems.map((item) => [item.slug, item]),
  );

  return dedupeProductSummaries([
    ...rows
      .filter((product) => product.isPublished)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toProductSummary)
      .map((product) => applySheetProductOverrides(product, itemBySlug.get(product.slug))),
    ...productItems
      .filter((item) => !rows.some((product) => product.slug === item.slug || slugifyCourseTitle(product.title) === item.slug))
      .map(sheetProductToSummary),
  ]);
});

export function getCourseSeoRiskReason(course: CourseSummary) {
  const entity = courseToSeoEntity(course);
  return getSeoRiskReason({
    title: entity.title,
    slug: entity.slug,
    category: entity.category,
    description: entity.description,
    type: entity.kind,
  });
}

export function getBundleSeoRiskReason(bundle: BundleItem) {
  const entity = bundleToSeoEntity(bundle);
  return getSeoRiskReason({
    title: entity.title,
    slug: entity.slug,
    category: entity.category,
    description: entity.description,
    type: entity.kind,
  });
}

export function getProductSeoRiskReason(product: ShopItem) {
  const entity = productToSeoEntity(product);
  return getSeoRiskReason({
    title: entity.title,
    slug: entity.slug,
    category: entity.category,
    description: entity.description,
    type: entity.kind,
  });
}

export function isCourseSeoIndexable(course: CourseSummary) {
  return !getCourseSeoRiskReason(course);
}

export function isBundleSeoIndexable(bundle: BundleItem) {
  return !getBundleSeoRiskReason(bundle);
}

export function isProductSeoIndexable(product: ShopItem) {
  return !getProductSeoRiskReason(product);
}

export const listSeoCourses = cache(async function listSeoCourses() {
  return (await listPublishedCourses()).filter(isCourseSeoIndexable);
});

export const listSeoBundles = cache(async function listSeoBundles() {
  return (await listPublishedBundles()).filter(isBundleSeoIndexable);
});

export const listSeoProducts = cache(async function listSeoProducts() {
  return (await listPublishedProducts()).filter(isProductSeoIndexable);
});

export async function listSeoCatalogEntities() {
  const [courses, bundles, products] = await Promise.all([
    listSeoCourses(),
    listSeoBundles(),
    listSeoProducts(),
  ]);

  return [
    ...courses.map(courseToSeoEntity),
    ...bundles.map(bundleToSeoEntity),
    ...products.map(productToSeoEntity),
  ];
}

export const listSeoCategories = cache(async function listSeoCategories(): Promise<SeoCategory[]> {
  const [courses, bundles, products] = await Promise.all([
    listPublishedCourses(),
    listPublishedBundles(),
    listPublishedProducts(),
  ]);

  return deriveSeoCategories({ courses, bundles, products });
});

export async function getSeoCategoryBySlug(slug: string) {
  return (await listSeoCategories()).find((category) => category.slug === slug) ?? null;
}

export async function getPublishedProductBySlug(slug: string) {
  const [sheetItems, rows] = await Promise.all([
    fetchSheetMixedContent().catch(() => []),
    listManagedProducts(),
  ]);
  const sheetItem = sheetItems.find((item) => item.type === 'product' && item.slug === slug);
  const product = rows.find(
    (entry) => entry.slug === slug && entry.isPublished,
  );
  if (product) {
    return applySheetProductOverrides(toProductSummary(product), sheetItem);
  }

  return sheetItem ? sheetProductToSummary(sheetItem) : null;
}

const GENERATED_BLOG_AUTHOR = 'দেশি কোর্স কনটেন্ট টিম';
const GENERATED_BLOG_DATE = '২৫ এপ্রিল, ২০২৬';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderList(items: string[], ordered = false) {
  const cleanItems = items.filter(Boolean).map(escapeHtml);
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${cleanItems.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
}

function renderFaq(items: Array<{ question: string; answer: string }>) {
  return `
    <h2>Common questions</h2>
    ${items
      .map(
        (item) =>
          `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`,
      )
      .join('')}
  `;
}

function generatedPost({
  slug,
  title,
  excerpt,
  content,
  image,
  category,
  tags,
}: Omit<BlogPost, 'id' | 'author' | 'date'>): BlogPost {
  return {
    id: `generated-${slug}`,
    slug,
    title,
    excerpt: clampSeoDescription(excerpt, title),
    content: sanitizeRichHtml(content),
    author: GENERATED_BLOG_AUTHOR,
    date: GENERATED_BLOG_DATE,
    image,
    category,
    tags: [...new Set(tags.filter(Boolean))],
  };
}

function buildCourseSeoBlogPost(course: CourseSummary) {
  const priceLine =
    course.price === 0
      ? `${course.title} বর্তমানে free course হিসেবে listed আছে।`
      : `${course.title} course price ৳${course.price}; checkout-এর আগে course page থেকে current access details দেখে নেওয়া উচিত।`;
  const faq = [
    {
      question: `${course.title} কার জন্য?`,
      answer: `${course.category} skill practicalভাবে শিখতে চান এমন learner, student, freelancer বা operator-এর জন্য এটি relevant হতে পারে।`,
    },
    {
      question: `Access কীভাবে পাব?`,
      answer:
        course.price === 0
          ? 'Free course হলে course page থেকে enrollment বা access instruction follow করতে হবে।'
          : 'Payment complete করার পরে dashboard/support flow অনুযায়ী access দেওয়া হয়।',
    },
    {
      question: `দাম কত?`,
      answer: priceLine,
    },
  ];

  return generatedPost({
    slug: `${course.slug}-course-guide`,
    title: `${course.title}: কী শিখবেন, কার জন্য, এবং কীভাবে শুরু করবেন`,
    excerpt: `${course.title} course-এর real catalog information, access, learning fit, key benefits এবং শুরু করার practical guide।`,
    image: course.image,
    category: 'কোর্স গাইড',
    tags: [course.title, course.category, 'Bangla Course', 'Deshi Course'],
    content: `
      <p><strong>Direct answer:</strong> ${escapeHtml(course.title)} হলো ${escapeHtml(course.category)} category-এর একটি বাংলা online course, যা ${escapeHtml(course.accessLabel)} access model সহ listed আছে।</p>
      <h2>${escapeHtml(course.title)} কী?</h2>
      <p>${escapeHtml(course.title)} course page-এর visible catalog data অনুযায়ী এটি ${escapeHtml(course.category)} skill শেখার জন্য সাজানো। Learner যেন offer, access এবং key inclusions আগে বুঝে সিদ্ধান্ত নিতে পারে, এই guide সেই context দেয়।</p>
      <h2>এই কোর্সে কী কী আছে?</h2>
      ${renderList(course.featureMetrics.slice(0, 6))}
      <h2>কারা এই course consider করবেন?</h2>
      ${renderList([
        `${course.category} topic নিয়ে structured Bangla learning চান এমন learner।`,
        `যারা ${course.title} related practical workflow বুঝে শুরু করতে চান।`,
        'যারা checkout-এর আগে access, support এবং value points পরিষ্কারভাবে compare করতে চান।',
      ])}
      <h2>কীভাবে শুরু করবেন?</h2>
      ${renderList([
        `${course.title} course page খুলে details, price এবং access note দেখুন।`,
        'নিজের skill level ও সময়ের সাথে course fit করে দেখুন।',
        'প্রশ্ন থাকলে contact/support channel ব্যবহার করুন।',
      ], true)}
      <h2>Pricing ও access</h2>
      <p>${escapeHtml(priceLine)} Access label: ${escapeHtml(course.accessLabel)}।</p>
      ${renderFaq(faq)}
      <h2>পরের ধাপ</h2>
      <p><a href="/courses/${course.slug}">${escapeHtml(course.title)} course details</a> দেখে current offer, access এবং support information মিলিয়ে সিদ্ধান্ত নিন।</p>
    `,
  });
}

function buildBundleSeoBlogPost(bundle: BundleItem, courses: CourseSummary[]) {
  const includedCourses = bundle.includedCourseSlugs
    .map((courseSlug) => courses.find((course) => course.slug === courseSlug)?.title)
    .filter((title): title is string => Boolean(title));
  const faq = [
    {
      question: `${bundle.title} bundle-এ কী আছে?`,
      answer: `${bundle.title} bundle page-এর visible data অনুযায়ী ${bundle.highlight} offer এবং ${bundle.accessLabel} access model আছে।`,
    },
    {
      question: `Bundle price কত?`,
      answer: `Current listed bundle price ৳${bundle.bundlePrice}।`,
    },
    {
      question: `এটি কার জন্য useful?`,
      answer: 'যারা related course/resource একসাথে নিয়ে faster learning বা execution flow চান, তাদের জন্য bundle format useful হতে পারে।',
    },
  ];

  return generatedPost({
    slug: `${bundle.slug}-bundle-guide`,
    title: `${bundle.title}: bundle value, included items এবং কার জন্য useful`,
    excerpt: `${bundle.title} bundle-এর included course/resource, price, access এবং practical use-case নিয়ে trust-first guide।`,
    image: bundle.image,
    category: 'বান্ডেল গাইড',
    tags: [bundle.title, bundle.highlight, 'Bundle Offer', 'Deshi Course'],
    content: `
      <p><strong>Direct answer:</strong> ${escapeHtml(bundle.title)} হলো ${escapeHtml(bundle.highlight)} type-এর bundle offer, যার listed price ৳${bundle.bundlePrice} এবং access label ${escapeHtml(bundle.accessLabel)}।</p>
      <h2>এই bundle কেন consider করবেন?</h2>
      <p>${escapeHtml(bundle.subtitle || `${bundle.title} related learning/resource একসাথে নেওয়ার option।`)}</p>
      <h2>Bundle-এ কী কী থাকছে?</h2>
      ${renderList(bundle.featureMetrics.slice(0, 6))}
      ${
        includedCourses.length > 0
          ? `<h2>Included course</h2>${renderList(includedCourses.slice(0, 8))}`
          : ''
      }
      <h2>কারা fastest value পেতে পারেন?</h2>
      ${renderList([
        'একই skill-stack-এর course/resource একসাথে নিতে চান এমন learner।',
        'Freelancer, creator বা operator যারা setup time কমাতে চান।',
        'যারা single checkout-এ multiple related item access করতে চান।',
      ])}
      <h2>কীভাবে ব্যবহার করবেন?</h2>
      ${renderList([
        'Bundle page থেকে included item এবং access terms দেখুন।',
        'প্রথমে core course/resource দিয়ে foundation ধরুন।',
        'তারপর included assets নিজের workflow-এ apply করুন।',
      ], true)}
      ${renderFaq(faq)}
      <h2>পরের ধাপ</h2>
      <p><a href="/bundles/${bundle.slug}">${escapeHtml(bundle.title)} bundle details</a> দেখে current offer verify করুন।</p>
    `,
  });
}

function buildProductSeoBlogPost(product: ShopItem) {
  const faq = [
    {
      question: `${product.title} কী?`,
      answer: `${product.title} হলো ${product.type} type-এর digital product/resource।`,
    },
    {
      question: `Delivery format কী?`,
      answer: `Current listed format: ${product.format}; access label: ${product.accessLabel}।`,
    },
    {
      question: `Price কত?`,
      answer: `Current listed price ৳${product.price}।`,
    },
  ];

  return generatedPost({
    slug: `${product.slug}-resource-guide`,
    title: `${product.title}: কী, কীভাবে ব্যবহার করবেন এবং কার জন্য useful`,
    excerpt: `${product.title} digital resource-এর format, access, price, use-case এবং কেনার আগে যা জানা দরকার।`,
    image: product.image,
    category: 'প্রোডাক্ট গাইড',
    tags: [product.title, product.type, 'Digital Product', 'Deshi Course'],
    content: `
      <p><strong>Direct answer:</strong> ${escapeHtml(product.title)} হলো ${escapeHtml(product.type)} category-এর একটি digital product/resource, যার listed price ৳${product.price} এবং format ${escapeHtml(product.format)}।</p>
      <h2>${escapeHtml(product.title)} কী?</h2>
      <p>${escapeHtml(product.description || `${product.title} একটি practical digital resource।`)}</p>
      <h2>এই resource-এ কী পাবেন?</h2>
      ${renderList(product.featureMetrics.slice(0, 6))}
      <h2>কাদের জন্য useful?</h2>
      ${renderList([
        `${product.type} resource দরকার এমন creator, freelancer বা operator।`,
        'যারা ready-made asset/resource দিয়ে setup time কমাতে চান।',
        'যারা checkout-এর আগে format, access এবং price clear করতে চান।',
      ])}
      <h2>কীভাবে ব্যবহার শুরু করবেন?</h2>
      ${renderList([
        'Product page থেকে current feature list এবং format দেখুন।',
        'নিজের use-case-এর সাথে মিল আছে কি না verify করুন।',
        'প্রশ্ন থাকলে support/contact channel ব্যবহার করুন।',
      ], true)}
      ${renderFaq(faq)}
      <h2>পরের ধাপ</h2>
      <p><a href="${templatePath(product.slug)}">${escapeHtml(product.title)} product details</a> দেখে current access information verify করুন।</p>
    `,
  });
}

function buildCategorySeoBlogPost(category: SeoCategory) {
  const topItems = category.items.slice(0, 6);

  return generatedPost({
    slug: `${category.slug}-guide`,
    title: `${category.title}: কোন item বেছে নেবেন এবং কীভাবে compare করবেন`,
    excerpt: `${category.title} category-এর real catalog items, comparison points, use-case এবং next-step guide।`,
    image: topItems[0]?.image || '/hero.webp',
    category: 'ক্যাটাগরি গাইড',
    tags: [category.name, category.title, 'Deshi Course'],
    content: `
      <p><strong>Direct answer:</strong> ${escapeHtml(category.title)} page-এ ${topItems.length}টি relevant catalog item দেখা যায়, যেগুলো price, access, format এবং use-case অনুযায়ী compare করা উচিত।</p>
      <h2>${escapeHtml(category.title)} category কী ধরনের learner-এর জন্য?</h2>
      <p>${escapeHtml(category.description)}</p>
      <h2>প্রথমে কোন বিষয়গুলো compare করবেন?</h2>
      ${renderList([
        'আপনার current skill level এবং learning goal।',
        'Price, access label এবং delivery/support model।',
        'Feature list real use-case-এর সাথে মেলে কি না।',
        'Course, bundle না template/resource - কোন format আপনার দরকার।',
      ], true)}
      <h2>এই category-এর selected items</h2>
      <ul>${topItems
        .map(
          (item) =>
            `<li><a href="${item.path}">${escapeHtml(item.title)}</a> - ${escapeHtml(item.category)}${item.price !== undefined ? `, price ${escapeHtml(String(item.price))} BDT` : ''}</li>`,
        )
        .join('')}</ul>
      ${renderFaq([
        {
          question: `${category.title} থেকে কীভাবে best item বেছে নেব?`,
          answer: 'প্রথমে goal, budget, access type এবং required format মিলিয়ে shortlist করুন। তারপর item detail page-এর visible feature list পড়ুন।',
        },
        {
          question: `এই category-এর সব item কি একই ধরনের?`,
          answer: 'না। কিছু course, কিছু bundle বা template/resource হতে পারে। তাই detail page দেখে সিদ্ধান্ত নেওয়া ভালো।',
        },
      ])}
      <h2>পরের ধাপ</h2>
      <p><a href="${category.path}">${escapeHtml(category.title)} category page</a> খুলে related itemগুলো compare করুন।</p>
    `,
  });
}

function buildServiceSeoBlogPosts() {
  const servicePosts = [
    {
      slug: 'deshi-course-certificate-access-guide',
      title: 'দেশি কোর্স certificate access: কোন course-এ কীভাবে verify করবেন',
      excerpt:
        'Certificate availability courseভেদে আলাদা হতে পারে; enrollment-এর আগে কোথায় কী check করবেন তার clear guide।',
      image: '/logo.webp',
      category: 'সাপোর্ট গাইড',
      tags: ['Certificate', 'Course Access', 'Deshi Course'],
      content: `
        <p><strong>Direct answer:</strong> দেশি কোর্সে certificate বা completion proof থাকলে সেটি নির্দিষ্ট course/offer detail-এ উল্লেখ থাকবে। সব course-এর জন্য একই certificate claim ধরে নেওয়া উচিত নয়।</p>
        <h2>Certificate নিয়ে কী check করবেন?</h2>
        ${renderList([
          'Course detail page-এ certificate বা completion proof mention আছে কি না।',
          'Support/contact channel-এ current policy verify করা।',
          'Payment-এর আগে access, delivery এবং support terms মিলিয়ে দেখা।',
        ], true)}
        ${renderFaq([
          {
            question: 'সব course-এ certificate আছে?',
            answer: 'না ধরে নেওয়াই safe। নির্দিষ্ট course page বা support team থেকে current availability verify করা উচিত।',
          },
          {
            question: 'Certificate দরকার হলে কী করব?',
            answer: 'Checkout করার আগে course page এবং contact/support channel দিয়ে certificate availability confirm করুন।',
          },
        ])}
        <h2>পরের ধাপ</h2>
        <p><a href="/services/certification">Certificate information page</a> এবং <a href="/courses">course catalog</a> দেখে current offer verify করুন।</p>
      `,
    },
    {
      slug: 'deshi-course-support-guide',
      title: 'দেশি কোর্স support guide: course access, payment ও delivery help কোথায় পাবেন',
      excerpt:
        'Course access, payment, delivery বা account issue হলে কোন support channel ব্যবহার করবেন তার practical guide।',
      image: '/logo.webp',
      category: 'সাপোর্ট গাইড',
      tags: ['Support', 'Payment Help', 'Course Access'],
      content: `
        <p><strong>Direct answer:</strong> দেশি কোর্সে support-এর জন্য contact page, WhatsApp, Messenger এবং email channel ব্যবহার করা যায়। Payment বা access issue হলে order/account details প্রস্তুত রাখুন।</p>
        <h2>কোন issue-তে কোথায় যাবেন?</h2>
        ${renderList([
          'Payment বা checkout issue হলে contact form বা WhatsApp ব্যবহার করুন।',
          'Course/resource access issue হলে account email এবং order detail দিন।',
          'General question হলে FAQ page আগে দেখে নিতে পারেন।',
        ], true)}
        ${renderFaq([
          {
            question: 'Support নিতে কী তথ্য লাগবে?',
            answer: 'আপনার account email, order/payment reference এবং কোন item নিয়ে issue হচ্ছে তা জানালে দ্রুত help পাওয়া যায়।',
          },
          {
            question: 'কোথা থেকে contact করব?',
            answer: 'Contact page-এ email, WhatsApp, Facebook এবং Messenger link দেওয়া আছে।',
          },
        ])}
        <h2>পরের ধাপ</h2>
        <p><a href="/contact">Contact page</a> অথবা <a href="/faq">FAQ page</a> থেকে support path বেছে নিন।</p>
      `,
    },
    {
      slug: 'deshi-course-refund-policy-guide',
      title: 'দেশি কোর্স refund policy: payment করার আগে কী জানা দরকার',
      excerpt:
        'Refund request কখন বিবেচনা হতে পারে এবং কখন digital access delivery হওয়ার পর refund প্রযোজ্য নয় - তার plain-language guide।',
      image: '/logo.webp',
      category: 'পলিসি গাইড',
      tags: ['Refund Policy', 'Terms', 'Payment'],
      content: `
        <p><strong>Direct answer:</strong> Payment complete হওয়ার পর যদি course/resource access বা delivery link এখনো দেওয়া না হয়ে থাকে, যাচাই সাপেক্ষে refund request বিবেচনা হতে পারে। Access/link/resource/share/group entry দেওয়া হলে refund প্রযোজ্য নয়।</p>
        <h2>Refund request করার আগে কী check করবেন?</h2>
        ${renderList([
          'Access বা delivery already হয়েছে কি না।',
          'আপনার payment/order reference আছে কি না।',
          'Policy page-এর latest wording পড়ে নেওয়া।',
        ], true)}
        ${renderFaq([
          {
            question: 'Delivery হয়ে গেলে refund হবে?',
            answer: 'Current policy অনুযায়ী access/link/resource/share/group entry দেওয়া হলে refund প্রযোজ্য নয়।',
          },
          {
            question: 'Refund request কোথায় করব?',
            answer: 'Contact page-এর support channel দিয়ে order detailসহ যোগাযোগ করুন।',
          },
        ])}
        <h2>পরের ধাপ</h2>
        <p><a href="/refund-policy">Refund policy</a> এবং <a href="/terms">terms page</a> পড়ে checkout decision নিন।</p>
      `,
    },
  ];

  return servicePosts.map(generatedPost);
}

async function listGeneratedSeoBlogPosts(): Promise<BlogPost[]> {
  const [courses, bundles, products, categories] = await Promise.all([
    listSeoCourses(),
    listSeoBundles(),
    listSeoProducts(),
    listSeoCategories(),
  ]);

  return [
    ...courses.map(buildCourseSeoBlogPost),
    ...bundles.map((bundle) => buildBundleSeoBlogPost(bundle, courses)),
    ...products.map(buildProductSeoBlogPost),
    ...categories.map(buildCategorySeoBlogPost),
    ...buildServiceSeoBlogPosts(),
  ];
}

export const listPublishedBlogPosts = cache(async function listPublishedBlogPosts() {
  const managedPosts = await listManagedBlogPosts();
  const managedSlugs = new Set(managedPosts.map((post) => post.slug));
  const publishedManagedPosts = managedPosts
    .filter((post) => post.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toPublicBlogPost);
  const generatedPosts = (await listGeneratedSeoBlogPosts()).filter(
    (post) => !managedSlugs.has(post.slug),
  );

  return [...publishedManagedPosts, ...generatedPosts].map((post, index) => ({
    ...post,
    id: post.id || String(index + 1),
  }));
});

export async function getPublishedBlogPostBySlug(slug: string) {
  const managedPost = (await listManagedBlogPosts()).find(
    (entry) => entry.slug === slug,
  );

  if (managedPost) {
    return managedPost.isPublished ? toPublicBlogPost(managedPost) : null;
  }

  return (await listGeneratedSeoBlogPosts()).find((post) => post.slug === slug) ?? null;
}

function buildGenericCourseDetail(
  course: ManagedCourse,
  faq: Array<{ question: string; answer: string }>,
): CourseDetail {
  return {
    ...toCourseSummary(course),
    language: 'বাংলা',
    heroSummary:
      course.shortDescription ||
      `${course.title} course-টি practical workflow-এ ${course.category} শিখতে সাহায্য করবে।`,
    description:
      course.shortDescription ||
      `${course.title} learner-friendly structured course।`,
    outcomeSummary:
      course.supportText ||
      `${course.title} related কাজে confidence ও execution build করতে পারবেন।`,
    deliverables:
      toStringArray(course.detailContent.deliverables).length > 0
        ? toStringArray(course.detailContent.deliverables)
        : course.featureMetrics,
    audience:
      toStringArray(course.detailContent.audience).length > 0
        ? toStringArray(course.detailContent.audience)
        : [`${course.category} skill শিখতে চান এমন learner`, 'Beginner থেকে execution-ready user'],
    workflow:
      toStringArray(course.detailContent.workflow).length > 0
        ? toStringArray(course.detailContent.workflow)
        : ['Enroll করুন', 'Lesson follow করুন', 'Practice করে apply করুন'],
    tools:
      toStringArray(course.detailContent.tools).length > 0
        ? toStringArray(course.detailContent.tools)
        : [course.category, course.instructor, 'Practical workflow'],
    support:
      course.supportText || 'Private support বা guidance included।',
    facts:
      toFactArray(course.detailContent.facts).length > 0
        ? toFactArray(course.detailContent.facts)
        : [
            { label: 'অ্যাক্সেস', value: course.accessLabel },
            { label: 'ক্যাটাগরি', value: course.category },
            { label: 'ইনস্ট্রাক্টর', value: course.instructor },
          ],
    faq,
    modules: toModuleArray(course.detailContent.modules),
  };
}

export async function getPublishedCourseDetailBySlug(slug: string) {
  const [managedCourse, courseFaq, sheetContent] = await Promise.all([
    (await listManagedCourses()).find((entry) => entry.slug === slug && entry.isPublished) ?? null,
    listPublishedFaqEntries('course', slug),
    fetchSheetCourseContent().catch(() => []),
  ]);

  const sheetCourse = sheetContent.find((item) => item.slug === slug);
  if (!managedCourse) {
    if (sheetCourse) {
      const fallback = (await getCourseBySlug(slug)) ?? null;
      return courseSheetToDetail(sheetCourse, fallback);
    }
    return null;
  }

  const legacyCourse = getCourseBySlug(slug);
  const mergedFaq =
    courseFaq.length > 0
      ? courseFaq.map((entry) => ({ question: entry.question, answer: entry.answer }))
      : toFaqArray(managedCourse.detailContent.faq).length > 0
        ? toFaqArray(managedCourse.detailContent.faq)
        : legacyCourse?.faq ?? [];

  if (!legacyCourse) {
    const base = buildGenericCourseDetail(managedCourse, mergedFaq);
    if (!sheetCourse) {
      return base;
    }
    return courseSheetToDetail(sheetCourse, base);
  }

  const merged = {
    ...legacyCourse,
    ...toCourseSummary(managedCourse),
    heroSummary:
      toString(managedCourse.detailContent.heroSummary) ||
      managedCourse.shortDescription ||
      legacyCourse.heroSummary,
    description:
      toString(managedCourse.detailContent.description) ||
      legacyCourse.description,
    outcomeSummary:
      toString(managedCourse.detailContent.outcomeSummary) ||
      managedCourse.supportText ||
      legacyCourse.outcomeSummary,
    deliverables:
      toStringArray(managedCourse.detailContent.deliverables).length > 0
        ? toStringArray(managedCourse.detailContent.deliverables)
        : legacyCourse.deliverables,
    audience:
      toStringArray(managedCourse.detailContent.audience).length > 0
        ? toStringArray(managedCourse.detailContent.audience)
        : legacyCourse.audience,
    workflow:
      toStringArray(managedCourse.detailContent.workflow).length > 0
        ? toStringArray(managedCourse.detailContent.workflow)
        : legacyCourse.workflow,
    tools:
      toStringArray(managedCourse.detailContent.tools).length > 0
        ? toStringArray(managedCourse.detailContent.tools)
        : legacyCourse.tools,
    support:
      toString(managedCourse.detailContent.support) ||
      managedCourse.supportText ||
      legacyCourse.support,
    facts:
      toFactArray(managedCourse.detailContent.facts).length > 0
        ? toFactArray(managedCourse.detailContent.facts)
        : legacyCourse.facts,
    faq: mergedFaq,
    modules:
      toModuleArray(managedCourse.detailContent.modules).length > 0
        ? toModuleArray(managedCourse.detailContent.modules)
        : legacyCourse.modules,
  } satisfies CourseDetail;

  if (!sheetCourse) {
    return merged;
  }

  const previewImage = await getTelegramCoursePreviewImage(sheetCourse.posterTelegramFileId || sheetCourse.title);
  return {
    ...merged,
    image: previewImage || sheetCourse.image || merged.image,
    title: sheetCourse.title || merged.title,
    slug: sheetCourse.slug || merged.slug,
    heroSummary: sheetCourse.rawText || merged.heroSummary,
    description: sheetCourse.rawText || merged.description,
    outcomeSummary: sheetCourse.rawText || merged.outcomeSummary,
    support: merged.support,
    facts: [
      ...merged.facts,
      ...(sheetCourse.primaryLink ? [{ label: 'Primary link', value: 'Available' }] : []),
    ],
  } satisfies CourseDetail;
}

function buildGenericBundleDetail(
  bundle: ManagedBundle,
  includedCourses: CourseSummary[],
  faq: Array<{ question: string; answer: string }>,
): PublicBundleDetail {
  return {
    ...toBundleSummary(bundle),
    overview:
      bundle.shortDescription ||
      `${bundle.title} bundle practicalভাবে multiple learning asset একসাথে পাওয়ার shortcut।`,
    deliverables:
      toStringArray(bundle.detailContent.deliverables).length > 0
        ? toStringArray(bundle.detailContent.deliverables)
        : bundle.featureMetrics,
    audience:
      toStringArray(bundle.detailContent.audience).length > 0
        ? toStringArray(bundle.detailContent.audience)
        : ['যারা one-shot combo offer চান', 'Skill stacking learners'],
    workflow:
      toStringArray(bundle.detailContent.workflow).length > 0
        ? toStringArray(bundle.detailContent.workflow)
        : ['Bundle কিনুন', 'Included assets access করুন', 'নিজের workflow-এ apply করুন'],
    faq,
    support: bundle.supportText || 'Bundle support included।',
    facts:
      toFactArray(bundle.detailContent.facts).length > 0
        ? toFactArray(bundle.detailContent.facts)
        : [
            { label: 'মূল কোর্স', value: String(bundle.includedCourseSlugs.length) },
            { label: 'অ্যাক্সেস', value: bundle.accessLabel },
            { label: 'হাইলাইট', value: bundle.highlight },
          ],
    includedCourses,
  };
}

function buildSheetBundleDetail(
  item: SheetCourseContent,
  allCourses: CourseSummary[],
  faq: Array<{ question: string; answer: string }>,
): PublicBundleDetail {
  const summary = sheetBundleToSummary(item);
  const rawText = item.rawText || item.title;
  const includedCourses = allCourses.filter((course) => rawText.includes(course.title));

  return {
    ...summary,
    overview: getSheetSummarySnippet(
      item.rawText,
      `${item.title} bundle-এ multiple resource/combo item একসাথে access করা যাবে।`,
    ),
    deliverables: [
      'Bundle/combo resource access',
      'Instant download or dashboard access',
      'Primary link available after payment',
    ],
    audience: ['যারা combo resource চান', 'Bundle buyer', 'Fast-start learners'],
    workflow: ['Purchase করুন', 'Primary link open করুন', 'Bundle resources ব্যবহার করুন'],
    faq:
      faq.length > 0
        ? faq
        : [
            {
              question: 'এটি কি bundle/combo item?',
              answer: 'হ্যাঁ, sheet sync অনুযায়ী এটি bundle page-এ mapped হয়েছে।',
            },
            {
              question: 'Access কীভাবে পাব?',
              answer: 'Payment-এর পরে primary link দিয়ে access/open করা যাবে।',
            },
          ],
    support: 'Sheet synced bundle support available.',
    facts: [
      { label: 'মূল কোর্স', value: String(includedCourses.length) },
      { label: 'অ্যাক্সেস', value: summary.accessLabel },
      { label: 'হাইলাইট', value: summary.highlight },
    ],
    includedCourses,
  };
}

export async function getPublishedBundleDetailBySlug(slug: string) {
  const [managedBundle, allCourses, bundleFaq, sheetItems] = await Promise.all([
    (await listManagedBundles()).find((entry) => entry.slug === slug && entry.isPublished) ?? null,
    listPublishedCourses(),
    listPublishedFaqEntries('bundle', slug),
    fetchSheetMixedContent().catch(() => []),
  ]);
  const sheetBundle = sheetItems.find((item) => item.type === 'bundle' && item.slug === slug) ?? null;

  if (!managedBundle) {
    return sheetBundle ? buildSheetBundleDetail(sheetBundle, allCourses, bundleFaq.map((entry) => ({ question: entry.question, answer: entry.answer }))) : null;
  }

  const includedCourses = managedBundle.includedCourseSlugs
    .map((courseSlug) => allCourses.find((course) => course.slug === courseSlug))
    .filter((course): course is CourseSummary => Boolean(course));
  const mergedFaq =
    bundleFaq.length > 0
      ? bundleFaq.map((entry) => ({ question: entry.question, answer: entry.answer }))
      : toFaqArray(managedBundle.detailContent.faq);
  const legacyBundle = getBundleDetailBySlug(slug);

  if (!legacyBundle) {
    return sheetBundle
      ? {
          ...buildSheetBundleDetail(sheetBundle, allCourses, mergedFaq),
          ...applySheetBundleOverrides(toBundleSummary(managedBundle), sheetBundle),
          includedCourses,
        }
      : buildGenericBundleDetail(managedBundle, includedCourses, mergedFaq);
  }

  return {
    ...legacyBundle,
    ...applySheetBundleOverrides(toBundleSummary(managedBundle), sheetBundle ?? undefined),
    overview:
      toString(managedBundle.detailContent.overview) ||
      sheetBundle?.rawText ||
      managedBundle.shortDescription ||
      legacyBundle.overview,
    deliverables:
      toStringArray(managedBundle.detailContent.deliverables).length > 0
        ? toStringArray(managedBundle.detailContent.deliverables)
        : legacyBundle.deliverables,
    audience:
      toStringArray(managedBundle.detailContent.audience).length > 0
        ? toStringArray(managedBundle.detailContent.audience)
        : legacyBundle.audience,
    workflow:
      toStringArray(managedBundle.detailContent.workflow).length > 0
        ? toStringArray(managedBundle.detailContent.workflow)
        : legacyBundle.workflow,
    faq: mergedFaq.length > 0 ? mergedFaq : legacyBundle.faq,
    support:
      toString(managedBundle.detailContent.support) ||
      managedBundle.supportText ||
      legacyBundle.support,
    facts:
      toFactArray(managedBundle.detailContent.facts).length > 0
        ? toFactArray(managedBundle.detailContent.facts)
        : legacyBundle.facts,
    includedCourses,
  } satisfies PublicBundleDetail;
}

function buildGenericProductDetail(
  product: ManagedProduct,
  faq: Array<{ question: string; answer: string }>,
): PublicProductDetail {
  return {
    ...toProductSummary(product),
    overview:
      product.shortDescription ||
      `${product.title} একটি practical digital resource।`,
    deliverables:
      toStringArray(product.detailContent.deliverables).length > 0
        ? toStringArray(product.detailContent.deliverables)
        : product.featureMetrics,
    useCases:
      toStringArray(product.detailContent.useCases).length > 0
        ? toStringArray(product.detailContent.useCases)
        : [product.type, 'Faster delivery', 'Repeatable workflow'],
    audience:
      toStringArray(product.detailContent.audience).length > 0
        ? toStringArray(product.detailContent.audience)
        : ['Digital product user', 'Creator, freelancer বা operator'],
    workflow:
      toStringArray(product.detailContent.workflow).length > 0
        ? toStringArray(product.detailContent.workflow)
        : ['Purchase করুন', 'Instant access নিন', 'নিজের use-case-এ apply করুন'],
    faq,
    support: product.supportText || 'Product support included।',
    facts:
      toFactArray(product.detailContent.facts).length > 0
        ? toFactArray(product.detailContent.facts)
        : [
            { label: 'Access', value: product.accessLabel },
            { label: 'Format', value: product.format },
            { label: 'Type', value: product.type },
          ],
  };
}

function buildSheetProductDetail(
  item: SheetCourseContent,
  faq: Array<{ question: string; answer: string }>,
): PublicProductDetail {
  const summary = sheetProductToSummary(item);

  return {
    ...summary,
    overview: getSheetSummarySnippet(
      item.rawText,
      `${item.title} ready-to-use digital product হিসেবে synced হয়েছে।`,
    ),
    deliverables: [
      'Instant digital access',
      'Primary access link available',
      'Telegram preview image synced',
    ],
    useCases: ['Ready-made resource use করা', 'Fast delivery', 'নিজের workflow-এ reuse করা'],
    audience: ['Digital product buyer', 'Creator / freelancer', 'Ready resource user'],
    workflow: ['Purchase করুন', 'Primary link open করুন', 'Resource use/download করুন'],
    faq:
      faq.length > 0
        ? faq
        : [
            {
              question: 'এটি কি course না product?',
              answer: 'Sheet classifier অনুযায়ী এটি product page-এ mapped হয়েছে।',
            },
            {
              question: 'Access কীভাবে পাব?',
              answer: 'Payment-এর পরে primary link দিয়ে access/open করা যাবে।',
            },
          ],
    support: 'Sheet synced product support available.',
    facts: [
      { label: 'Access', value: summary.accessLabel },
      { label: 'Format', value: summary.format },
      { label: 'Type', value: summary.type },
    ],
  };
}

export async function getPublishedProductDetailBySlug(slug: string) {
  const [managedProduct, productFaq, sheetItems] = await Promise.all([
    (await listManagedProducts()).find((entry) => entry.slug === slug && entry.isPublished) ?? null,
    listPublishedFaqEntries('shop', slug),
    fetchSheetMixedContent().catch(() => []),
  ]);
  const sheetProduct = sheetItems.find((item) => item.type === 'product' && item.slug === slug) ?? null;

  if (!managedProduct) {
    return sheetProduct ? buildSheetProductDetail(sheetProduct, productFaq.map((entry) => ({ question: entry.question, answer: entry.answer }))) : null;
  }

  const mergedFaq =
    productFaq.length > 0
      ? productFaq.map((entry) => ({ question: entry.question, answer: entry.answer }))
      : toFaqArray(managedProduct.detailContent.faq);
  const legacyProduct = getProductDetailBySlug(slug);

  if (!legacyProduct) {
    return sheetProduct
      ? {
          ...buildSheetProductDetail(sheetProduct, mergedFaq),
          ...applySheetProductOverrides(toProductSummary(managedProduct), sheetProduct),
        }
      : buildGenericProductDetail(managedProduct, mergedFaq);
  }

  return {
    ...legacyProduct,
    ...applySheetProductOverrides(toProductSummary(managedProduct), sheetProduct ?? undefined),
    overview:
      toString(managedProduct.detailContent.overview) ||
      sheetProduct?.rawText ||
      managedProduct.shortDescription ||
      legacyProduct.overview,
    deliverables:
      toStringArray(managedProduct.detailContent.deliverables).length > 0
        ? toStringArray(managedProduct.detailContent.deliverables)
        : legacyProduct.deliverables,
    useCases:
      toStringArray(managedProduct.detailContent.useCases).length > 0
        ? toStringArray(managedProduct.detailContent.useCases)
        : legacyProduct.useCases,
    audience:
      toStringArray(managedProduct.detailContent.audience).length > 0
        ? toStringArray(managedProduct.detailContent.audience)
        : legacyProduct.audience,
    workflow:
      toStringArray(managedProduct.detailContent.workflow).length > 0
        ? toStringArray(managedProduct.detailContent.workflow)
        : legacyProduct.workflow,
    faq: mergedFaq.length > 0 ? mergedFaq : legacyProduct.faq,
    support:
      toString(managedProduct.detailContent.support) ||
      managedProduct.supportText ||
      legacyProduct.support,
    facts:
      toFactArray(managedProduct.detailContent.facts).length > 0
        ? toFactArray(managedProduct.detailContent.facts)
        : legacyProduct.facts,
  } satisfies PublicProductDetail;
}
