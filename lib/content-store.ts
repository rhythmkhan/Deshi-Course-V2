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
  fetchSheetCourseContent,
  fetchSheetMixedContent,
  getTelegramCoursePreviewImage,
  normalizeCatalogPrice,
  type SheetCourseContent,
} from '@/lib/catalog-sync';
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

export async function listManagedCourses() {
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
}

export async function listManagedBundles() {
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
}

export async function listManagedProducts() {
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
}

export async function listManagedBlogPosts() {
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
}

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

export async function listManagedFaqEntries(
  scope?: ManagedFaqEntry['scope'],
  scopeSlug?: string,
) {
  if (!canUseAdminContent()) {
    return FALLBACK_FAQ_ENTRIES.filter((entry) =>
      (!scope || entry.scope === scope) &&
      (!scopeSlug || entry.scopeSlug === scopeSlug),
    );
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

  const filtered = rows.filter((entry) =>
    (!scope || entry.scope === scope) &&
    (!scopeSlug || entry.scopeSlug === scopeSlug),
  );

  return filtered.length > 0 || rows.length > 0
    ? filtered
    : FALLBACK_FAQ_ENTRIES.filter((entry) =>
        (!scope || entry.scope === scope) &&
        (!scopeSlug || entry.scopeSlug === scopeSlug),
      );
}

export async function listPublishedFaqEntries(
  scope?: ManagedFaqEntry['scope'],
  scopeSlug?: string,
) {
  return (await listManagedFaqEntries(scope, scopeSlug))
    .filter((entry) => entry.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listManagedHomepageSections() {
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
}

export async function getHomepageSection(sectionKey: string) {
  return (await listManagedHomepageSections()).find(
    (section) => section.sectionKey === sectionKey && section.isPublished,
  ) ?? null;
}

export async function listManagedTestimonials() {
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
}

export async function listPublishedTestimonials() {
  return (await listManagedTestimonials())
    .filter((entry) => entry.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listManagedAnnouncementBanners() {
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
}

export async function listActiveAnnouncementBanners() {
  const now = Date.now();
  return (await listManagedAnnouncementBanners()).filter((banner) => {
    const startsAt = banner.startsAt ? new Date(banner.startsAt).getTime() : null;
    const endsAt = banner.endsAt ? new Date(banner.endsAt).getTime() : null;

    return (
      banner.isActive &&
      (startsAt === null || startsAt <= now) &&
      (endsAt === null || endsAt >= now)
    );
  });
}

export async function listPublishedCourses() {
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
}

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

export async function listFeaturedCourses() {
  return (await listManagedCourses())
    .filter((course) => course.isPublished && course.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toCourseSummary);
}

export async function listPublishedBundles() {
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
}

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

export async function listPublishedProducts() {
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

export async function listPublishedBlogPosts() {
  return (await listManagedBlogPosts())
    .filter((post) => post.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toPublicBlogPost);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const post = (await listManagedBlogPosts()).find(
    (entry) => entry.slug === slug && entry.isPublished,
  );
  return post ? toPublicBlogPost(post) : null;
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
