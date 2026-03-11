export interface BundleItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  bundlePrice: number;
  originalPrice: number;
  accessLabel: string;
  highlight: string;
  includedCourseSlugs: string[];
  featureMetrics: string[];
  tag?: string;
}

export const BUNDLE_CATALOG: BundleItem[] = [
  {
    id: 1,
    slug: 'n8n-course-plus-templates',
    title: 'n8n Course + Templates',
    subtitle: 'n8n course-এর সাথে ready-made workflow template pack একসাথে',
    image: '/images/offers/n8n-course-plus-templates.svg',
    bundlePrice: 999,
    originalPrice: 999,
    accessLabel: 'Lifetime access',
    highlight: 'Course + templates combo',
    includedCourseSlugs: ['n8n-automation-mastery'],
    featureMetrics: [
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Ready-made n8n workflow templates included',
      'Private support group access',
      'Certificate of completion',
    ],
    tag: 'জনপ্রিয়',
  },
  {
    id: 2,
    slug: 'vibe-coding-prompt-library',
    title: 'Vibe Coding + Prompt Library',
    subtitle: 'Vibe coding course-এর সাথে prompt library add-on একসাথে',
    image: '/images/offers/vibe-coding-mastery.webp',
    bundlePrice: 499,
    originalPrice: 499,
    accessLabel: 'Lifetime access',
    highlight: 'Course + prompt library combo',
    includedCourseSlugs: ['vibe-coding-mastery'],
    featureMetrics: [
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Prompt + UI Library included',
      'Private support group access',
      'Certificate of completion',
    ],
    tag: 'নতুন',
  },
];

export const getBundleBySlug = (slug: string) =>
  BUNDLE_CATALOG.find((bundle) => bundle.slug === slug);
