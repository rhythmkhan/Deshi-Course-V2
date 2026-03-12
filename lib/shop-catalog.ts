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
  featureMetrics: string[];
  tag?: string;
}

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  'n8n-20k-templates': '/images/products/n8n-20k-templates.webp',
  'prompt-ui-library': '/images/products/prompt-ui-library.webp',
  lovable: '/images/products/lovable.webp',
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
  createProduct(3, 'Lovable', 'lovable', 'Tool resource', 'Lovable workflow, setup resource আর usage guidance একসাথে।', 'tool'),
  createProduct(
    4,
    '1M + T-Shirt Design Package',
    '1m-plus-tshirt-design-package',
    'Design pack',
    'T-shirt design pack, ready asset collection আর reuse-friendly design resource।',
    'design',
  ),
  createProduct(
    5,
    'Monkey vlog viral video',
    'monkey-vlog-viral-video',
    'Video resource',
    'Monkey vlog style viral video resource আর ready content direction।',
    'video',
  ),
  createProduct(
    6,
    '600+ WordPress Premium Website Templates',
    '600-plus-wordpress-premium-website-templates',
    'Website templates',
    'WordPress website template collection, fast launch আর setup-friendly resource।',
    'wordpress',
  ),
  createProduct(
    7,
    'WordPress Premium Themes and Plugins (3000+)',
    'wordpress-premium-themes-and-plugins-3000-plus',
    'Themes & plugins',
    'Large WordPress theme and plugin library, multiple use-case support সহ।',
    'wordpress',
  ),
  createProduct(
    8,
    'BM Verify Certificate',
    'bm-verify-certificate',
    'Verify resource',
    'BM verify related certificate resource, workflow note আর ready access pack।',
    'verify',
  ),
  createProduct(
    9,
    'Ai Horror Reels Bundle - drive',
    'ai-horror-reels-bundle-drive',
    'Reels bundle',
    'AI horror reels resource bundle, drive delivery আর fast content reuse flow।',
    'bundle',
  ),
  createProduct(
    10,
    '1000+ anime Reels Bundle - drive',
    '1000-plus-anime-reels-bundle-drive',
    'Reels bundle',
    'Anime reels drive bundle, reusable clips আর quick publish workflow।',
    'anime',
  ),
];

export const getShopBySlug = (slug: string) =>
  SHOP_CATALOG.find((item) => item.slug === slug);
