import { buildCatalogArt } from './catalog-art';

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
  includedShopSlugs?: string[];
  featureMetrics: string[];
  tag?: string;
}

const BUNDLE_IMAGE_BY_SLUG: Record<string, string> = {
  'n8n-course-plus-templates': '/images/bundles/n8n-course-plus-templates.webp',
  'vibe-coding-prompt-library': '/images/bundles/vibe-coding-prompt-library.webp',
  'ai-career-duo-bundle': '/images/bundles/ai-career-duo-bundle.webp',
  'creator-launch-bundle': '/images/bundles/creator-launch-bundle.webp',
};

export const BUNDLE_CATALOG: BundleItem[] = [
  {
    id: 1,
    slug: 'n8n-course-plus-templates',
    title: 'n8n Course + Templates',
    subtitle: 'n8n basics to pro শেখার সাথে ready-made workflow template pack একসাথে',
    image: BUNDLE_IMAGE_BY_SLUG['n8n-course-plus-templates'],
    bundlePrice: 999,
    originalPrice: 999,
    accessLabel: 'Lifetime access',
    highlight: 'Learn + deploy combo',
    includedCourseSlugs: ['n8n-automation-mastery'],
    featureMetrics: [
      'n8n basics থেকে pro শেখার flow',
      'Ready-made n8n workflow templates included',
      'Lead / CRM / Ecom use-case faster start',
      'Private support group access',
      'Lifetime access, কোনো monthly fee নাই',
    ],
    tag: 'জনপ্রিয়',
  },
  {
    id: 2,
    slug: 'vibe-coding-prompt-library',
    title: 'Vibe Coding + Prompt Library',
    subtitle: 'Vibe coding course-এর সাথে prompt library add-on একসাথে',
    image: BUNDLE_IMAGE_BY_SLUG['vibe-coding-prompt-library'],
    bundlePrice: 999,
    originalPrice: 999,
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
  {
    id: 3,
    slug: 'ai-career-duo-bundle',
    title: 'AI Career Duo Bundle',
    subtitle: 'n8n automation আর vibe coding - দুইটা flagship course একসাথে',
    image: BUNDLE_IMAGE_BY_SLUG['ai-career-duo-bundle'] ?? buildCatalogArt('AI Career Duo Bundle', 'bundle', 'Bundle'),
    bundlePrice: 499,
    originalPrice: 499,
    accessLabel: 'Lifetime access',
    highlight: 'Two-course combo',
    includedCourseSlugs: ['n8n-automation-mastery', 'vibe-coding-mastery'],
    featureMetrics: [
      '২টি flagship course একসাথে',
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'n8n + vibe দুই track-এর private support access',
      'Certificate of completion',
    ],
    tag: 'বেস্ট ভ্যালু',
  },
  {
    id: 4,
    slug: 'creator-launch-bundle',
    title: 'Creator Launch Bundle',
    subtitle: 'Vibe coding, prompt library, n8n course আর 20K+ template নিয়ে full creator stack',
    image: BUNDLE_IMAGE_BY_SLUG['creator-launch-bundle'] ?? buildCatalogArt('Creator Launch Bundle', 'bundle', 'Bundle'),
    bundlePrice: 1299,
    originalPrice: 1896,
    accessLabel: 'Lifetime access',
    highlight: '2 courses + 2 resources',
    includedCourseSlugs: ['vibe-coding-mastery', 'n8n-automation-mastery'],
    includedShopSlugs: ['prompt-ui-library', 'n8n-20k-templates'],
    featureMetrics: [
      'Vibe Coding Mastery course included',
      'Prompt + UI Library included',
      'n8n Automation Mastery course included',
      'n8n 20K+ Templates access included',
      'Lifetime access, কোনো monthly fee নাই',
      'Private support group access',
    ],
    tag: 'কম্বো',
  },
];

export const getBundleBySlug = (slug: string) =>
  BUNDLE_CATALOG.find((bundle) => bundle.slug === slug);

export function bundleIncludesCourse(
  bundle: BundleItem | null | undefined,
  courseSlug: string,
) {
  return Boolean(bundle?.includedCourseSlugs.includes(courseSlug));
}

export function bundleIncludesShop(
  bundle: BundleItem | null | undefined,
  shopSlug: string,
) {
  return Boolean(bundle?.includedShopSlugs?.includes(shopSlug));
}
