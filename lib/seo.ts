import type { Metadata } from 'next';
import { SITE_URL } from './site-url';

const DEFAULT_OG_IMAGE = '/hero.webp';

export const SITE_NAME = 'দেশি কোর্স';

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
};

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function normalizeImageUrl(image?: string) {
  return absoluteUrl(image || DEFAULT_OG_IMAGE);
}

export function buildMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noIndex = false,
}: MetadataInput): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const socialImage = normalizeImageUrl(image);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'bn-BD': canonicalUrl,
      },
    },
    openGraph: {
      type,
      url: canonicalUrl,
      title,
      description,
      siteName: SITE_NAME,
      locale: 'bn_BD',
      images: [
        {
          url: socialImage,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildCollectionPageSchema(
  name: string,
  description: string,
  path: string,
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(item.path),
        name: item.name,
      })),
    },
  };
}

type CommercialItemSchemaInput = {
  name: string;
  description: string;
  path: string;
  image?: string;
  price: number;
  category: string;
  keywords?: string[];
};

export function buildCommercialItemSchema({
  name,
  description,
  path,
  image,
  price,
  category,
  keywords = [],
}: CommercialItemSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: normalizeImageUrl(image),
    category,
    sku: path.replace(/\//g, '').trim(),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    keywords: keywords.join(', '),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(path),
      priceCurrency: 'BDT',
      price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function buildFaqSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildBlogPostingSchema({
  title,
  description,
  path,
  image,
  author,
  datePublished,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  author: string;
  datePublished?: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: normalizeImageUrl(image),
    mainEntityOfPage: absoluteUrl(path),
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
    },
    datePublished,
    dateModified: datePublished,
    keywords: keywords.join(', '),
    inLanguage: 'bn-BD',
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
    sameAs: [
      'https://www.facebook.com/DeshiCourse',
      'https://www.messenger.com/t/956128257564286',
      'https://wa.me/8801813896400',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+8801813896400',
        email: 'info@deshicourse.xyz',
        areaServed: 'BD',
        availableLanguage: ['bn', 'en'],
      },
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'bn-BD',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/courses?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

const BANGLA_MONTHS: Record<string, number> = {
  জানুয়ারি: 1,
  ফেব্রুয়ারি: 2,
  মার্চ: 3,
  এপ্রিল: 4,
  মে: 5,
  জুন: 6,
  জুলাই: 7,
  আগস্ট: 8,
  সেপ্টেম্বর: 9,
  অক্টোবর: 10,
  নভেম্বর: 11,
  ডিসেম্বর: 12,
};

export function parseBanglaDateToIso(value: string) {
  const normalized = value.replace(/[০-৯]/g, (digit) =>
    String('০১২৩৪৫৬৭৮৯'.indexOf(digit)),
  );
  const match = normalized.match(/(\d{1,2})\s+([^\s,]+),\s*(\d{4})/);

  if (!match) {
    return undefined;
  }

  const [, day, monthName, year] = match;
  const month = BANGLA_MONTHS[monthName];

  if (!month) {
    return undefined;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`;
}
