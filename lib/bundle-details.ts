import { BUNDLE_CATALOG, getBundleBySlug } from './bundle-catalog';
import { getCourseCardBySlug } from './course-details';

interface BundleFaq {
  question: string;
  answer: string;
}

interface BundleFact {
  label: string;
  value: string;
}

interface BundleDetailContent {
  overview: string;
  deliverables: string[];
  audience: string[];
  workflow: string[];
  faq: BundleFaq[];
  support: string;
  facts: BundleFact[];
}

const BUNDLE_DETAIL_CONTENT: Record<string, BundleDetailContent> = {
  'n8n-course-plus-templates': {
    overview:
      'n8n basics to pro শেখার সাথে ready-made workflow templates একসাথে নিতে চাইলে এই bundle সবচেয়ে practical option। এতে শেখার পর lead, CRM, email, e-commerce বা ops use-case-এ template adapt করে দ্রুত live workflow চালু করা সহজ হবে।',
    deliverables: [
      'n8n Automation Mastery course access',
      'n8n setup, node, workflow structure ও debugging শেখার structured lesson flow',
      'Ready-made n8n workflow templates',
      'Lead / CRM / Ecom / Marketing use-case faster launch advantage',
      'Private support group access',
      'Lifetime access, কোনো monthly fee নাই',
      'Certificate of completion',
    ],
    audience: [
      'যারা automation শিখে সাথে সাথে ready template use করতে চান',
      'business owner, ecommerce ops বা operator যারা দ্রুত automation deploy করতে চান',
      'freelancer বা agency owner যারা client workflow দ্রুত deliver করতে চান',
      'marketing, sales বা support team যারা repeat কাজ অটো করতে চান',
    ],
    workflow: [
      'প্রথমে course-এর core automation flow শিখে n8n basics to pro foundation strong করুন',
      'তারপর included templates duplicate করে lead, CRM, email বা order workflow নিজের use-case-এ adapt করুন',
      'শেষে private support group-এ feedback নিয়ে client-ready বা business-ready workflow polish করুন',
    ],
    faq: [
      {
        question: 'এই bundle-এ কি course আর template দুটোই থাকবে?',
        answer: 'হ্যাঁ, মূল n8n course-এর সাথে ready-made template pack একসাথে পাবেন।',
      },
      {
        question: 'Monthly fee আছে কি?',
        answer: 'না, এটি lifetime one-time access bundle।',
      },
      {
        question: 'Future update bundle user-ও পাবে?',
        answer: 'হ্যাঁ, bundle user হিসেবে future update free পাবেন।',
      },
    ],
    support:
      'Course access, template pack, private support group এবং standard completion certificate bundle-এর মধ্যেই থাকবে, যাতে শিখে সঙ্গে সঙ্গে deploy করতে পারেন।',
    facts: [
      { label: 'মূল কোর্স', value: '১টি' },
      { label: 'এক্সট্রা', value: 'Workflow templates' },
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'ফোকাস', value: 'Learn + deploy' },
    ],
  },
  'vibe-coding-prompt-library': {
    overview:
      'Vibe coding শেখার সাথে Prompt + UI Library একসাথে পেতে চাইলে এই bundle আপনাকে শেখা আর execution-এর মধ্যে gap কমাতে সাহায্য করবে।',
    deliverables: [
      'Vibe Coding Mastery course access',
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Bonus: Prompt + UI Library',
      'Private support group access',
      'Certificate of completion',
    ],
    audience: [
      'AI-assisted coding workflow নিয়ে faster build করতে চান এমন learner',
      'prompt + UI block ready reference সহ coding করতে চান এমন creator',
      'live review + support group access চান এমন practical user',
    ],
    workflow: [
      'প্রথমে course দিয়ে build workflow ধরুন',
      'তারপর Prompt + UI Library use করে faster iteration practice করুন',
      'শেষে support group ও live review feedback দিয়ে workflow refine করুন',
    ],
    faq: [
      {
        question: 'এই bundle-এ কি Prompt + UI Library আছে?',
        answer: 'হ্যাঁ, Vibe Coding course-এর সাথে Prompt + UI Library bundle-এর অংশ।',
      },
      {
        question: 'Bundle price user-provided course price-এর চেয়ে বেশি কেন?',
        answer: 'কারণ এতে মূল course-এর সাথে extra Prompt + UI Library ও support সুবিধা bundled আছে।',
      },
      {
        question: 'Access lifetime থাকবে?',
        answer: 'হ্যাঁ, এটি lifetime access offer। monthly fee নেই।',
      },
    ],
    support:
      'Private support group, weekly live Q&A + build review, course access এবং Prompt + UI Library একসাথে পাবেন।',
    facts: [
      { label: 'মূল কোর্স', value: '১টি' },
      { label: 'এক্সট্রা', value: 'Prompt + UI' },
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'সাপোর্ট', value: 'Build review' },
    ],
  },
  'ai-career-duo-bundle': {
    overview:
      'Automation আর AI-assisted building দুইটা skill একসাথে ধরতে চাইলে এই bundle সবচেয়ে direct shortcut। n8n Automation Mastery এবং Vibe Coding Mastery একসাথে নিয়ে execution, delivery আর career growth - তিনটাই parallel build করা যাবে।',
    deliverables: [
      'n8n Automation Mastery course access',
      'Vibe Coding Mastery course access',
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'দুই track-এর private support access',
      'Certificate of completion',
    ],
    audience: [
      'যারা AI automation আর AI-assisted coding দুইটাই practicalভাবে শিখতে চান',
      'freelancer বা creator যারা multiple service line build করতে চান',
      'career switcher যারা fast-growing দুইটা skill একসাথে ধরতে চান',
    ],
    workflow: [
      'প্রথমে n8n দিয়ে workflow automation আর systems mindset ধরুন',
      'তারপর vibe coding দিয়ে দ্রুত landing, tool বা MVP build করা শিখুন',
      'শেষে দুই skill combine করে client work, product build বা internal automation use-case তৈরি করুন',
    ],
    faq: [
      {
        question: 'এই bundle-এ কি দুইটা course-ই থাকবে?',
        answer: 'হ্যাঁ, n8n Automation Mastery এবং Vibe Coding Mastery দুইটিই bundle-এর মধ্যে আছে।',
      },
      {
        question: 'দুই track-এর support access পাওয়া যাবে?',
        answer: 'হ্যাঁ, bundle user হিসেবে relevant support access ও delivery links পাওয়া যাবে।',
      },
      {
        question: 'এটা কার জন্য সবচেয়ে useful?',
        answer: 'যারা একসাথে automation + AI build workflow শিখে faster execution capability বানাতে চান তাদের জন্য।',
      },
    ],
    support:
      'দুইটা flagship track-এর learning flow, private support access এবং long-term skill stacking advantage এই bundle-এর মূল value।',
    facts: [
      { label: 'মূল কোর্স', value: '২টি' },
      { label: 'ফোকাস', value: 'Automation + Build' },
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'ভ্যালু', value: 'Best combo' },
    ],
  },
  'creator-launch-bundle': {
    overview:
      'দ্রুত AI-assisted build করা আর ready-made automation template use করে execution speed বাড়াতে চাইলে এই bundle সবচেয়ে practical। Vibe Coding Mastery-এর সাথে n8n template library থাকায় build + automation দুই দিকই একসাথে এগোবে।',
    deliverables: [
      'Vibe Coding Mastery course access',
      'n8n 20K+ Templates access',
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Private support group access',
      'Certificate of completion',
    ],
    audience: [
      'creator বা freelancer যারা দ্রুত build করে delivery দিতে চান',
      'যারা AI-assisted coding-এর সাথে ready automation resource-ও চান',
      'launch-ready tool, landing বা workflow stack বানাতে চান এমন learner',
    ],
    workflow: [
      'প্রথমে vibe coding course দিয়ে build flow শিখুন',
      'তারপর n8n template library থেকে প্রয়োজনীয় workflow pick করুন',
      'শেষে build আর automation combine করে নিজের launch-ready system বানান',
    ],
    faq: [
      {
        question: 'এই bundle-এ কি course আর template দুটোই থাকবে?',
        answer: 'হ্যাঁ, Vibe Coding Mastery course-এর সাথে n8n 20K+ Templates access একসাথে থাকবে।',
      },
      {
        question: 'এটি কার জন্য বেশি useful?',
        answer: 'যারা build + workflow automation stack একসাথে রাখতে চান তাদের জন্য সবচেয়ে useful।',
      },
      {
        question: 'Lifetime access থাকবে?',
        answer: 'হ্যাঁ, এটি lifetime one-time access bundle।',
      },
    ],
    support:
      'Course learning flow, template resource access এবং private support direction একসাথে এই bundle-এর মধ্যে থাকবে।',
    facts: [
      { label: 'মূল কোর্স', value: '১টি' },
      { label: 'এক্সট্রা', value: '20K+ templates' },
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'স্টাইল', value: 'Launch-ready' },
    ],
  },
};

export function getBundleDetailBySlug(slug: string) {
  const bundle = getBundleBySlug(slug);
  const content = BUNDLE_DETAIL_CONTENT[slug];

  if (!bundle || !content) {
    return null;
  }

  const includedCourses = bundle.includedCourseSlugs
    .map((courseSlug) => getCourseCardBySlug(courseSlug))
    .filter((course): course is NonNullable<typeof course> => Boolean(course));

  return {
    ...bundle,
    ...content,
    includedCourses,
  };
}

export function getAllBundleDetailSlugs() {
  return BUNDLE_CATALOG.map((bundle) => bundle.slug);
}
