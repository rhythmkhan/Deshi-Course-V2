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
      'n8n course-এর শেখা আর ready-made workflow templates একসাথে নিতে চাইলে এই bundle সবচেয়ে practical option। শিখে সঙ্গে সঙ্গে নিজের use-case-এ template adapt করা সহজ হবে।',
    deliverables: [
      'n8n Automation Mastery course access',
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Bonus: ready-made n8n workflow templates',
      'Private support group access',
      'Certificate of completion',
    ],
    audience: [
      'যারা automation শিখে সাথে সাথে ready template use করতে চান',
      'business owner বা operator যারা দ্রুত automation deploy করতে চান',
      'freelancer যারা client workflow দ্রুত deliver করতে চান',
    ],
    workflow: [
      'প্রথমে course-এর core automation flow শিখুন',
      'তারপর included templates duplicate করে নিজের use-case-এ adapt করুন',
      'শেষে private support group-এ feedback নিয়ে workflow polish করুন',
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
      'Course access, template pack, private support group এবং standard completion certificate bundle-এর মধ্যেই থাকবে।',
    facts: [
      { label: 'মূল কোর্স', value: '১টি' },
      { label: 'এক্সট্রা', value: 'Template pack' },
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'সাপোর্ট', value: 'Private group' },
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
