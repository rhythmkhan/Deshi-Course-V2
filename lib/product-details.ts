import { SHOP_CATALOG, getShopBySlug, type ShopItem } from './shop-catalog';

interface ProductFaq {
  question: string;
  answer: string;
}

interface ProductFact {
  label: string;
  value: string;
}

interface ProductDetailContent {
  overview: string;
  deliverables: string[];
  useCases: string[];
  audience: string[];
  workflow: string[];
  faq: ProductFaq[];
  support: string;
  facts: ProductFact[];
}

function buildGenericProductDetail(product: ShopItem): ProductDetailContent {
  return {
    overview: `${product.title} একটি ${product.type.toLowerCase()} resource, যেটা দ্রুত access নিয়ে নিজের কাজ, content বা delivery flow-এ ব্যবহার করা যাবে।`,
    deliverables: [
      'Lifetime access, কোনো monthly fee নাই',
      'Instant digital access',
      'All future updates free',
      'Private support group access',
    ],
    useCases: [
      `${product.title} related কাজ দ্রুত শুরু করতে`,
      'নিজের workflow, content বা client delivery-তে resource ব্যবহার করতে',
      'repeat use-case-এ faster execution flow বানাতে',
    ],
    audience: [
      `${product.title} use করতে চান এমন beginner বা active user`,
      'creator, freelancer বা operator যারা ready resource চান',
      'যারা digital product নিয়ে faster execution চান',
    ],
    workflow: [
      'Purchase-এর পর instant access নিন',
      'Resource download/open করে নিজের use-case-এ বসান',
      'প্রয়োজনে private support group direction follow করে final output ready করুন',
    ],
    faq: [
      {
        question: 'এটি কি lifetime access product?',
        answer: 'হ্যাঁ, বর্তমান offer অনুযায়ী lifetime access থাকবে।',
      },
      {
        question: 'Monthly fee লাগবে কি?',
        answer: 'না, এটি one-time purchase resource।',
      },
      {
        question: 'Instant access পাওয়া যাবে?',
        answer: 'হ্যাঁ, product format অনুযায়ী instant digital access ধরা হয়েছে।',
      },
    ],
    support:
      'Private support group access থাকবে, যাতে product use করার সময় basic direction পাওয়া যায়।',
    facts: [
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'Format', value: 'Digital' },
      { label: 'ডেলিভারি', value: 'Instant' },
      { label: 'সাপোর্ট', value: 'Private group' },
    ],
  };
}

const SPECIFIC_PRODUCT_DETAILS: Record<string, ProductDetailContent> = {
  'n8n-20k-templates': {
    overview:
      'n8n workflow manually from scratch না বানিয়ে দ্রুত ready automation use করতে চাইলে এই template library সবচেয়ে useful। বিভিন্ন use-case অনুযায়ী pack-by-pack templates পাবেন এবং plug-and-play setup guide follow করে দ্রুত চালু করতে পারবেন।',
    deliverables: [
      'Templates lifetime access, কোনো monthly fee নাই',
      '20,000+ ready-made n8n templates',
      'Lead / CRM / Ecom / Marketing template packs',
      'Plug-and-play setup guide',
      'Monthly new template drops',
    ],
    useCases: [
      'lead collection, follow-up বা CRM automation দ্রুত চালু করতে',
      'ecommerce, marketing বা reporting workflow setup করতে',
      'নিজের use-case অনুযায়ী ready template customize করতে',
    ],
    audience: [
      'automation learner যারা ready example collection চান',
      'agency, operator বা business owner যারা দ্রুত deploy করতে চান',
      'n8n user যারা use-case library expand করতে চান',
    ],
    workflow: [
      'প্রথমে প্রয়োজনীয় pack select করুন',
      'setup guide follow করে template import করুন',
      'তারপর নিজের tool, webhook বা data source অনুযায়ী customize করুন',
    ],
    faq: [
      {
        question: 'Templates access কি lifetime হবে?',
        answer: 'হ্যাঁ, এটি lifetime access offer। monthly fee নেই।',
      },
      {
        question: 'New template drop কি extra payment দিয়ে নিতে হবে?',
        answer: 'না, monthly new template drops included থাকবে।',
      },
      {
        question: 'Beginner user-ও কি use করতে পারবে?',
        answer: 'হ্যাঁ, plug-and-play setup guide beginner user-দেরও help করবে।',
      },
    ],
    support:
      'Access-এর সাথে setup direction থাকবে, আর template pack structure এমনভাবে দেওয়া হবে যাতে use-case অনুযায়ী দ্রুত pick করতে পারেন।',
    facts: [
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'টেমপ্লেট', value: '20K+' },
      { label: 'ড্রপ', value: 'Monthly new' },
      { label: 'সেটআপ', value: 'Plug-and-play' },
    ],
  },
  'prompt-ui-library': {
    overview:
      'Prompt + UI Library এমন একটি ready resource collection যেখানে landing page, tool interface আর dashboard use-case অনুযায়ী prompt + UI block একসাথে পাবেন। copy-paste flow থাকায় দ্রুত build করতে সুবিধা হবে।',
    deliverables: [
      'Prompt library lifetime access, কোনো monthly fee নাই',
      '5,000+ prompt + UI blocks',
      'Landing / Tool / Dashboard packs',
      'Copy-paste setup guide',
      'Monthly new prompt drops',
    ],
    useCases: [
      'landing page, tool page বা dashboard idea দ্রুত assemble করতে',
      'prompt-driven build workflow-এ ready block use করতে',
      'UI direction আর prompt structure একসাথে reuse করতে',
    ],
    audience: [
      'vibe coder বা builder যারা faster execution চান',
      'creator যারা prompt + UI reference library রাখতে চান',
      'landing, tool বা dashboard pack খুঁজছেন এমন learner',
    ],
    workflow: [
      'প্রথমে প্রয়োজনীয় pack বা block category select করুন',
      'তারপর prompt এবং UI block copy-paste করে নিজের project-এ বসান',
      'শেষে নিজের use-case অনুযায়ী tweak করে final build-ready করুন',
    ],
    faq: [
      {
        question: 'এটি কি lifetime access library?',
        answer: 'হ্যাঁ, one-time purchase-এর পরে lifetime access পাবেন। monthly fee নেই।',
      },
      {
        question: 'New prompt drop কি included থাকবে?',
        answer: 'হ্যাঁ, monthly new prompt drops included থাকবে।',
      },
      {
        question: 'এখানে কি শুধু prompt আছে, UI block নেই?',
        answer: 'না, এখানে prompt-এর সাথে UI blocks-ও রয়েছে। landing, tool এবং dashboard packs included।',
      },
    ],
    support:
      'Copy-paste setup guide দেওয়া থাকবে, যাতে prompt আর UI block দ্রুত নিজের build flow-এ বসাতে পারেন।',
    facts: [
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'ব্লক', value: '5K+' },
      { label: 'প্যাক', value: 'Landing / Tool / Dashboard' },
      { label: 'ড্রপ', value: 'Monthly new' },
    ],
  },
};

export function getProductDetailBySlug(slug: string) {
  const product = getShopBySlug(slug);

  if (!product) {
    return null;
  }

  const content = SPECIFIC_PRODUCT_DETAILS[slug] ?? buildGenericProductDetail(product);

  return {
    ...product,
    ...content,
  };
}

export function getAllProductDetailSlugs() {
  return SHOP_CATALOG.map((product) => product.slug);
}
