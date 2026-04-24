export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentVisibility = 'public' | 'hidden' | 'draft' | 'archived';

export interface ManagedCourse {
  id: string;
  legacyId: number | null;
  slug: string;
  title: string;
  category: string;
  level: CourseLevel;
  price: number;
  originalPrice: number;
  image: string;
  instructor: string;
  accessLabel: string;
  tag: string;
  promoTag: string | null;
  featureMetrics: string[];
  shortDescription: string;
  detailContent: Record<string, unknown>;
  gallery: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  badgeLabel: string | null;
  supportText: string | null;
  accessDurationDays: number | null;
  visibility: ContentVisibility;
  metadata: Record<string, unknown>;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedBundle {
  id: string;
  legacyId: number | null;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  bundlePrice: number;
  originalPrice: number;
  accessLabel: string;
  highlight: string;
  featureMetrics: string[];
  includedCourseSlugs: string[];
  shortDescription: string;
  detailContent: Record<string, unknown>;
  gallery: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  badgeLabel: string | null;
  supportText: string | null;
  visibility: ContentVisibility;
  metadata: Record<string, unknown>;
  tag: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedProduct {
  id: string;
  legacyId: number | null;
  slug: string;
  title: string;
  type: string;
  image: string;
  price: number;
  description: string;
  format: string;
  accessLabel: string;
  featureMetrics: string[];
  shortDescription: string;
  detailContent: Record<string, unknown>;
  gallery: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  badgeLabel: string | null;
  supportText: string | null;
  accessDurationDays: number | null;
  visibility: ContentVisibility;
  metadata: Record<string, unknown>;
  tag: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedBlogPost {
  id: string;
  legacyId: string | null;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  displayDate: string;
  publishedAt: string | null;
  image: string;
  category: string;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  metadata: Record<string, unknown>;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettingRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface ManagedFaqEntry {
  id: string;
  scope: 'site' | 'course' | 'bundle' | 'shop';
  scopeSlug: string | null;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedHomepageSection {
  id: string;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  body: Record<string, unknown>;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  rating: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedAnnouncementBanner {
  id: string;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  theme: string;
  isActive: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}
