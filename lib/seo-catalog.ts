import type { BundleItem } from './bundle-catalog';
import type { CourseSummary } from './course-catalog';
import type { ShopItem } from './shop-catalog';

export type SeoCatalogKind = 'course' | 'bundle' | 'template';

export interface SeoCatalogEntity {
  kind: SeoCatalogKind;
  slug: string;
  title: string;
  path: string;
  category: string;
  description: string;
  image?: string;
  price?: number;
}

export interface SeoCategory {
  slug: string;
  name: string;
  kind: 'courses' | 'templates' | 'bundles';
  title: string;
  description: string;
  path: string;
  items: SeoCatalogEntity[];
}

const RISKY_SEO_PATTERNS = [
  /\bcrack(?:ed|ing)?\b/i,
  /\bcarding\b/i,
  /\bbinning\b/i,
  /\bblack\s*hat\b/i,
  /\bspamm?ing\b/i,
  /\bsms\s*bomb/i,
  /\baccount\s*crack/i,
  /\bpaid\s+course\s+for\s+free\b/i,
  /\budemy\s+courses?\s+all\b/i,
  /\bfree\s+(?:rdp|vps)\b/i,
  /\bapk\s*mod/i,
  /ক্র্যাক/i,
  /বোম্বিং/i,
] as const;

const CONTEXTUAL_RISK_PATTERNS = [
  /\bfacebook\b.*\bhack/i,
  /\bhack\b.*\bfacebook\b/i,
  /\binstagram\b.*\bhack/i,
  /\bhack\b.*\binstagram\b/i,
  /\bwifi\b.*\b(?:hack|crack)/i,
  /\b(?:hack|crack)\b.*\bwifi\b/i,
  /\bpassword\b.*\bbypass\b/i,
  /\bbypass\b.*\bpassword\b/i,
  /\bwebsite\b.*\bhacking\b/i,
  /\bphone\b.*\bhack/i,
  /\bbluetooth\b.*\bhack/i,
  /\btermux\b.*\bhack/i,
  /\bunlimited\s+id\b/i,
] as const;

const GENERIC_CATEGORY_NAMES = new Set([
  'শীট থেকে কোর্স',
  'sheet synced bundle',
  'sheet synced product',
]);

export function slugifySeoPath(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export function templatePath(slug: string) {
  return `/products/${slug}`;
}

export function coursePath(slug: string) {
  return `/courses/${slug}`;
}

export function bundlePath(slug: string) {
  return `/bundles/${slug}`;
}

export function getSeoRiskReason(input: {
  title: string;
  slug?: string;
  category?: string;
  description?: string;
  type?: string;
}) {
  const text = [
    input.title,
    input.slug,
    input.category,
    input.description,
    input.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!text.trim()) {
    return 'missing catalog text';
  }

  const matchedRisk = RISKY_SEO_PATTERNS.find((pattern) => pattern.test(text));
  if (matchedRisk) {
    return `matched risky term: ${matchedRisk.source}`;
  }

  const matchedContext = CONTEXTUAL_RISK_PATTERNS.find((pattern) =>
    pattern.test(text),
  );
  if (matchedContext) {
    return `matched risky context: ${matchedContext.source}`;
  }

  return null;
}

export function isSeoIndexableCatalogItem(input: {
  title: string;
  slug?: string;
  category?: string;
  description?: string;
  type?: string;
}) {
  return !getSeoRiskReason(input);
}

export function clampSeoDescription(value: string, fallback: string) {
  const text = (value || fallback).replace(/\s+/g, ' ').trim();
  if (text.length <= 155) {
    return text;
  }

  return `${text.slice(0, 152).replace(/\s+\S*$/, '')}...`;
}

export function formatBdtPrice(value?: number) {
  if (value === undefined) {
    return '';
  }

  return value === 0 ? 'FREE' : `৳${value}`;
}

export function courseToSeoEntity(course: CourseSummary): SeoCatalogEntity {
  return {
    kind: 'course',
    slug: course.slug,
    title: course.title,
    path: coursePath(course.slug),
    category: course.category,
    description: course.featureMetrics.join(' '),
    image: course.image,
    price: course.price,
  };
}

export function bundleToSeoEntity(bundle: BundleItem): SeoCatalogEntity {
  return {
    kind: 'bundle',
    slug: bundle.slug,
    title: bundle.title,
    path: bundlePath(bundle.slug),
    category: 'বান্ডেল',
    description: bundle.subtitle || bundle.featureMetrics.join(' '),
    image: bundle.image,
    price: bundle.bundlePrice,
  };
}

export function productToSeoEntity(product: ShopItem): SeoCatalogEntity {
  return {
    kind: 'template',
    slug: product.slug,
    title: product.title,
    path: templatePath(product.slug),
    category: product.type,
    description: product.description || product.featureMetrics.join(' '),
    image: product.image,
    price: product.price,
  };
}

export function filterSeoEntities(items: SeoCatalogEntity[]) {
  return items.filter((item) =>
    isSeoIndexableCatalogItem({
      title: item.title,
      slug: item.slug,
      category: item.category,
      description: item.description,
      type: item.kind,
    }),
  );
}

function buildCategory(
  kind: SeoCategory['kind'],
  name: string,
  items: SeoCatalogEntity[],
): SeoCategory {
  const slug = `${kind}-${slugifySeoPath(name)}`;
  const label =
    kind === 'courses'
      ? 'কোর্স'
      : kind === 'templates'
        ? 'প্রোডাক্ট ও টেমপ্লেট'
        : 'বান্ডেল';

  return {
    slug,
    name,
    kind,
    title: `${name} ${label}`,
    description: `${name} related ${label} এক জায়গায় দেখুন। সব item real catalog data থেকে নেওয়া হয়েছে।`,
    path: `/categories/${slug}`,
    items,
  };
}

function pushGroupedCategories(
  categories: SeoCategory[],
  kind: SeoCategory['kind'],
  groups: Map<string, SeoCatalogEntity[]>,
  minItems: number,
) {
  for (const [name, items] of groups.entries()) {
    if (items.length < minItems || GENERIC_CATEGORY_NAMES.has(name.toLowerCase())) {
      continue;
    }

    categories.push(buildCategory(kind, name, items));
  }
}

export function deriveSeoCategories({
  courses,
  products,
  bundles,
}: {
  courses: CourseSummary[];
  products: ShopItem[];
  bundles: BundleItem[];
}) {
  const categories: SeoCategory[] = [];
  const courseGroups = new Map<string, SeoCatalogEntity[]>();
  const productGroups = new Map<string, SeoCatalogEntity[]>();
  const indexableCourses = filterSeoEntities(courses.map(courseToSeoEntity));
  const indexableProducts = filterSeoEntities(products.map(productToSeoEntity));
  const indexableBundles = filterSeoEntities(bundles.map(bundleToSeoEntity));

  for (const course of indexableCourses) {
    const group = courseGroups.get(course.category) ?? [];
    group.push(course);
    courseGroups.set(course.category, group);
  }

  for (const product of indexableProducts) {
    const group = productGroups.get(product.category) ?? [];
    group.push(product);
    productGroups.set(product.category, group);
  }

  pushGroupedCategories(categories, 'courses', courseGroups, 2);
  pushGroupedCategories(categories, 'templates', productGroups, 2);

  if (indexableBundles.length >= 2) {
    categories.push(buildCategory('bundles', 'Course Bundle', indexableBundles));
  }

  return categories.sort((left, right) => left.title.localeCompare(right.title));
}

export function findSeoCategory(
  categories: SeoCategory[],
  slug: string,
) {
  return categories.find((category) => category.slug === slug) ?? null;
}

export function relatedSeoEntities(
  current: SeoCatalogEntity,
  candidates: SeoCatalogEntity[],
  limit = 4,
) {
  return candidates
    .filter((item) => item.slug !== current.slug)
    .filter((item) => item.kind === current.kind || item.category === current.category)
    .slice(0, limit);
}
