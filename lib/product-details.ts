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
  lovable: {
    overview:
      'Lovable Pro 1000 Credit বাংলাদেশ pack এমন buyer-দের জন্য, যারা বড় build, বেশি prompt run আর long মেয়াদের usage চান। WhatsApp delivery, Pro feature access আর stacked credit usage মিলিয়ে এটা heavy-use pack হিসেবে সাজানো হয়েছে।',
    deliverables: [
      '১০০০ original credit package',
      '৯ মাস মেয়াদ',
      'Pro-এর সব feature use করার সুযোগ',
      'একটি email-এ unlimited plan activate করা যাবে',
      'প্রতিদিন ৫ credit যোগ হবে',
      '৯ মাস পর free-তে আরও ৫০০ credit পাওয়া যাবে',
      'WhatsApp delivery support',
    ],
    useCases: [
      'Lovable-এ landing page, tool বা app build বেশি volume-এ করতে',
      'long-term builder workflow চালাতে',
      'credit জমিয়ে larger prompt cycle run করতে',
      'low-rate large package নিতে',
    ],
    audience: [
      'Lovable heavy user বা agency builder',
      'যারা long মেয়াদের credit package চান',
      'যারা Pro feature use করে নিয়মিত build করেন',
    ],
    workflow: [
      'Purchase করার পর WhatsApp-এ delivery process follow করুন',
      'নিজের email দিয়ে plan activate করুন',
      'credit use করে build flow চালান, আর daily credit top-up monitor করুন',
    ],
    faq: [
      {
        question: 'এখানে কয়টি credit থাকবে?',
        answer: 'এই package-এ ১০০০ original credit থাকবে।',
      },
      {
        question: 'এটি কতদিন মেয়াদ থাকবে?',
        answer: 'বর্তমান offer অনুযায়ী ৯ মাস মেয়াদ থাকবে।',
      },
      {
        question: 'Delivery কীভাবে হবে?',
        answer: 'আপনার email নিয়ে WhatsApp-এর মাধ্যমে delivery support দেওয়া হবে।',
      },
    ],
    support:
      'WhatsApp delivery support থাকবে, যাতে activation বা access নিয়ে সমস্যা হলে দ্রুত direction পাওয়া যায়।',
    facts: [
      { label: 'ক্রেডিট', value: '1000' },
      { label: 'মেয়াদ', value: '৯ মাস' },
      { label: 'ডেলিভারি', value: 'WhatsApp' },
      { label: 'প্ল্যান', value: 'Pro' },
    ],
  },
  'lovable-400-credit': {
    overview:
      'Lovable 400 Credit pack low-cost entry option হিসেবে রাখা হয়েছে, যাতে কম খরচে Lovable workflow শুরু করা যায়। Pro feature use, daily credit top-up আর short-to-mid term usage focus এখানে রাখা হয়েছে।',
    deliverables: [
      '৪০০ original credit package',
      '৫ মাস পর্যন্ত use window',
      'Pro-এর সব feature use করার সুযোগ',
      'একটি email-এ unlimited plan activate করা যাবে',
      'প্রতিদিন ৫ credit যোগ হবে',
      '১ মাস পর free-তে আরও ৪০০ credit পাওয়া যাবে',
    ],
    useCases: [
      'Lovable প্রথমবার start করতে',
      'short budget-এ real build workflow test করতে',
      'কম খরচে Pro feature access নিতে',
    ],
    audience: [
      'beginner builder',
      'budget-conscious Lovable user',
      'যারা smaller credit pack দিয়ে শুরু করতে চান',
    ],
    workflow: [
      'Purchase করার পর delivery instruction নিন',
      'নিজের email-এ plan activate করুন',
      'daily credit top-up use করে build চালিয়ে যান',
    ],
    faq: [
      {
        question: 'এখানে কয়টি credit থাকবে?',
        answer: 'এই package-এ ৪০০ original credit থাকবে।',
      },
      {
        question: 'এটি কি Pro feature use করতে দেবে?',
        answer: 'হ্যাঁ, visible offer অনুযায়ী Pro-এর সব feature use করা যাবে।',
      },
      {
        question: 'এটি কার জন্য ভালো?',
        answer: 'যারা কম খরচে Lovable workflow শুরু করতে চান, তাদের জন্য এটি ভালো entry package।',
      },
    ],
    support:
      'Delivery এবং activation নিয়ে basic direction দেওয়া হবে, যাতে দ্রুত credit use শুরু করতে পারেন।',
    facts: [
      { label: 'ক্রেডিট', value: '400' },
      { label: 'মেয়াদ', value: '৫ মাস পর্যন্ত' },
      { label: 'ডেলিভারি', value: 'WhatsApp' },
      { label: 'প্ল্যান', value: 'Pro access' },
    ],
  },
  'lovable-pro-200-credit': {
    overview:
      'Lovable Pro 200 Credit হলো smallest starter offer, যেটা low-entry budget-এ Pro build workflow test করার জন্য suitable। limited মেয়াদ, daily credit add-on আর prompt-based build trial focus এখানে আছে।',
    deliverables: [
      '২০০ original credit package',
      'আগামী মাসের ৩১ তারিখ পর্যন্ত মেয়াদ',
      'Pro-এর সব feature use করার সুযোগ',
      'একটি email-এ unlimited plan activate করা যাবে',
      'প্রতিদিন ৫ credit যোগ হবে',
      '১ মাস পর free-তে আরও ৫০০ credit পাওয়া যাবে',
    ],
    useCases: [
      'Lovable Pro workflow test করতে',
      'small budget-এ credit-based build শুরু করতে',
      'prompt run ও early-stage project experiment করতে',
    ],
    audience: [
      'starter buyer',
      'যারা first-time Lovable try করতে চান',
      'small-budget builder',
    ],
    workflow: [
      'Purchase-এর পর delivery instruction follow করুন',
      'নিজের email-এ plan activate করুন',
      'credit use করে ছোট build বা test project run করুন',
    ],
    faq: [
      {
        question: 'এখানে কয়টি credit থাকবে?',
        answer: 'এই package-এ ২০০ original credit থাকবে।',
      },
      {
        question: 'মেয়াদ কতদিন থাকবে?',
        answer: 'বর্তমান visible offer অনুযায়ী আগামী মাসের ৩১ তারিখ পর্যন্ত মেয়াদ থাকবে।',
      },
      {
        question: 'এটি কি beginner-দের জন্য okay?',
        answer: 'হ্যাঁ, low-entry package হওয়ায় starter user-দের জন্য suitable।',
      },
    ],
    support:
      'Activation এবং early use নিয়ে basic support direction পাওয়া যাবে।',
    facts: [
      { label: 'ক্রেডিট', value: '200' },
      { label: 'মেয়াদ', value: 'Next month 31' },
      { label: 'ডেলিভারি', value: 'WhatsApp' },
      { label: 'প্ল্যান', value: 'Pro access' },
    ],
  },
  'n8n-20k-templates': {
    overview:
      'n8n workflow manually from scratch না বানিয়ে দ্রুত ready automation use করতে চাইলে এই template library সবচেয়ে useful। lead, CRM, e-commerce, marketing, ops বা reporting use-case অনুযায়ী pack-by-pack templates পাবেন এবং plug-and-play setup guide follow করে দ্রুত চালু করতে পারবেন।',
    deliverables: [
      'Templates lifetime access, কোনো monthly fee নাই',
      '20,000+ ready-made n8n templates',
      'Lead / CRM / Ecom / Marketing template packs',
      'Real-world workflow use-case library',
      'Plug-and-play setup guide',
      'Monthly new template drops',
    ],
    useCases: [
      'lead collection, follow-up বা CRM automation দ্রুত চালু করতে',
      'ecommerce, marketing বা reporting workflow setup করতে',
      'ops, alerts, enrichment বা approval workflow দ্রুত দাঁড় করাতে',
      'নিজের use-case অনুযায়ী ready template customize করতে',
    ],
    audience: [
      'automation learner যারা ready example collection চান',
      'agency, operator বা business owner যারা দ্রুত deploy করতে চান',
      'ecommerce ops, marketing team, data folks বা ops manager যারা repeat কাজ অটো করতে চান',
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
      'Access-এর সাথে setup direction থাকবে, আর template pack structure এমনভাবে দেওয়া হবে যাতে use-case অনুযায়ী দ্রুত pick, adapt এবং launch করতে পারেন।',
    facts: [
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'টেমপ্লেট', value: '20K+' },
      { label: 'ফোকাস', value: 'Real workflows' },
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
