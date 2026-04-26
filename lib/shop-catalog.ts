import { buildCatalogArt, type CatalogArtTheme } from './catalog-art';

export interface ShopItem {
  id: number;
  slug: string;
  title: string;
  type: string;
  image: string;
  price: number;
  description: string;
  format: string;
  accessLabel: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featureMetrics: string[];
  tag?: string;
}

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  'n8n-20k-templates': '/images/products/n8n-20k-templates.webp',
  'prompt-ui-library': '/images/products/prompt-ui-library.webp',
  lovable: '/images/products/lovable.webp',
  'lovable-400-credit': '/images/products/lovable.webp',
  'lovable-pro-200-credit': '/images/products/lovable.webp',
  '1m-plus-tshirt-design-package': '/images/products/1m-plus-tshirt-design-package.webp',
  'monkey-vlog-viral-video': '/images/products/monkey-vlog-viral-video.webp',
  '600-plus-wordpress-premium-website-templates': '/images/products/600-plus-wordpress-premium-website-templates.webp',
  'wordpress-premium-themes-and-plugins-3000-plus': '/images/products/wordpress-premium-themes-and-plugins-3000-plus.webp',
  'bm-verify-certificate': '/images/products/bm-verify-certificate.webp',
  'ai-horror-reels-bundle-drive': '/images/products/ai-horror-reels-bundle-drive.webp',
  '1000-plus-anime-reels-bundle-drive': '/images/products/1000-plus-anime-reels-bundle-drive.webp',
};

function createProduct(
  id: number,
  title: string,
  slug: string,
  type: string,
  description: string,
  theme: CatalogArtTheme,
) {
  return {
    id,
    slug,
    title,
    type,
    image: PRODUCT_IMAGE_BY_SLUG[slug] ?? buildCatalogArt(title, theme, 'Product'),
    price: 99,
    description,
    format: 'Instant digital access',
    accessLabel: 'Lifetime access',
    featureMetrics: [
      'Lifetime access, কোনো monthly fee নাই',
      'Instant digital access',
      'All future updates free',
      'Private support group access',
    ],
    tag: 'নতুন',
  } satisfies ShopItem;
}

export const SHOP_CATALOG: ShopItem[] = [
  {
    id: 1,
    slug: 'n8n-20k-templates',
    title: 'n8n 20K+ Templates',
    type: 'টেমপ্লেট লাইব্রেরি',
    image: PRODUCT_IMAGE_BY_SLUG['n8n-20k-templates'],
    price: 899,
    description: '20,000+ ready-made n8n templates, pack-by-pack use-case coverage এবং plug-and-play setup guide।',
    format: 'Instant digital access',
    accessLabel: 'Lifetime access',
    featureMetrics: [
      'Lifetime access, কোনো monthly fee নাই',
      '20,000+ ready-made n8n templates',
      'Lead / CRM / Ecom / Marketing packs',
      'Plug-and-play setup guide',
      'Monthly new template drops',
    ],
    tag: 'জনপ্রিয়',
  },
  {
    id: 2,
    slug: 'prompt-ui-library',
    title: 'Prompt + UI Library',
    type: 'Prompt library',
    image: PRODUCT_IMAGE_BY_SLUG['prompt-ui-library'],
    price: 399,
    description: '5,000+ prompt + UI blocks, landing/tool/dashboard pack আর copy-paste setup guide।',
    format: 'Instant digital access',
    accessLabel: 'Lifetime access',
    featureMetrics: [
      'Prompt library lifetime access, কোনো monthly fee নাই',
      '5,000+ prompt + UI blocks',
      'Landing / Tool / Dashboard packs',
      'Copy-paste setup guide',
      'Monthly new prompt drops',
    ],
    tag: 'নতুন',
  },
  {
    id: 3,
    slug: 'lovable',
    title: 'Lovable Pro 1000 Credit বাংলাদেশ',
    type: 'Lovable credit package',
    image: PRODUCT_IMAGE_BY_SLUG.lovable,
    price: 1999,
    description: 'Lovable Pro credit pack, WhatsApp delivery আর long-term build-ready usage একসাথে।',
    format: 'WhatsApp delivery',
    accessLabel: '৯ মাস মেয়াদ',
    featureMetrics: [
      '১০০০ original credit package',
      'Pro-এর সব feature use করা যাবে',
      'একটি email-এ unlimited plan activate করা যাবে',
      'প্রতিদিন ৫ credit যোগ হবে',
      'Unique prompt build-এর জন্য credit stack করা যাবে',
      'সবচেয়ে কম রেটে available package',
      '৯ মাস পর free-তে আরও ৫০০ credit পাওয়া যাবে',
    ],
    tag: 'Best Seller',
  },
  {
    id: 4,
    slug: 'lovable-400-credit',
    title: 'Lovable 400 Credit',
    type: 'Lovable credit package',
    image: PRODUCT_IMAGE_BY_SLUG['lovable-400-credit'],
    price: 399,
    description: 'Lovable 400 credit pack, short-term use আর low-cost builder access একসাথে।',
    format: 'WhatsApp delivery',
    accessLabel: '৫ মাস পর্যন্ত',
    featureMetrics: [
      '৪০০ original credit package',
      'Pro-এর সব feature use করা যাবে',
      'একটি email-এ unlimited plan activate করা যাবে',
      'প্রতিদিন ৫ credit যোগ হবে',
      'কম খরচে Lovable workflow শুরু করা যাবে',
      '১ মাস পর free-তে আরও ৪০০ credit পাওয়া যাবে',
    ],
    tag: 'Featured',
  },
  {
    id: 5,
    slug: 'lovable-pro-200-credit',
    title: 'Lovable Pro 200 Credit',
    type: 'Lovable credit package',
    image: PRODUCT_IMAGE_BY_SLUG['lovable-pro-200-credit'],
    price: 199,
    description: 'Lovable Pro 200 credit pack, entry-level offer আর fast-start usage option।',
    format: 'WhatsApp delivery',
    accessLabel: 'আগামী মাসের ৩১ তারিখ পর্যন্ত',
    featureMetrics: [
      '২০০ original credit package',
      'Pro-এর সব feature use করা যাবে',
      'একটি email-এ unlimited plan activate করা যাবে',
      'প্রতিদিন ৫ credit যোগ হবে',
      'Unique prompt build-এর জন্য credit stack করা যাবে',
      '১ মাস পর free-তে আরও ৫০০ credit পাওয়া যাবে',
    ],
    tag: 'Featured',
  },
  createProduct(
    6,
    '1M + T-Shirt Design Package',
    '1m-plus-tshirt-design-package',
    'Design pack',
    'T-shirt design pack, ready asset collection আর reuse-friendly design resource।',
    'design',
  ),
  createProduct(
    7,
    'Monkey vlog viral video',
    'monkey-vlog-viral-video',
    'Video resource',
    'Monkey vlog style viral video resource আর ready content direction।',
    'video',
  ),
  {
    ...createProduct(
      8,
      '600+ WordPress Premium Website Templates',
      '600-plus-wordpress-premium-website-templates',
      'Website templates',
      'WordPress website template collection, fast launch আর setup-friendly resource।',
      'wordpress',
    ),
    price: 999,
  },
  {
    ...createProduct(
      9,
      'WordPress Premium Themes and Plugins (3000+)',
      'wordpress-premium-themes-and-plugins-3000-plus',
      'Themes & plugins',
      'Large WordPress theme and plugin library, multiple use-case support সহ।',
      'wordpress',
    ),
    price: 1999,
  },
  {
    ...createProduct(
      10,
      'BM Verify Certificate',
      'bm-verify-certificate',
      'Verify resource',
      'BM verify related certificate resource, workflow note আর ready access pack।',
      'verify',
    ),
    price: 299,
  },
  createProduct(
    11,
    'Ai Horror Reels Bundle - drive',
    'ai-horror-reels-bundle-drive',
    'Reels bundle',
    'AI horror reels resource bundle, drive delivery আর fast content reuse flow।',
    'bundle',
  ),
  createProduct(
    12,
    '1000+ anime Reels Bundle - drive',
    '1000-plus-anime-reels-bundle-drive',
    'Reels bundle',
    'Anime reels drive bundle, reusable clips আর quick publish workflow।',
    'anime',
  ),
];

export const getShopBySlug = (slug: string) =>
  SHOP_CATALOG.find((item) => item.slug === slug);
