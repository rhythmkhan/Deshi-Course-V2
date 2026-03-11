import { COURSE_CATALOG, type CourseSummary } from './course-catalog';

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface CourseFact {
  label: string;
  value: string;
}

export interface CourseDetail extends CourseSummary {
  language: string;
  heroSummary: string;
  description: string;
  outcomeSummary: string;
  deliverables: string[];
  audience: string[];
  workflow: string[];
  tools: string[];
  support: string;
  certificate: string;
  facts: CourseFact[];
  faq: CourseFaq[];
}

type CourseDetailOverrides = Partial<Omit<CourseDetail, keyof CourseSummary>>;

const courseCardsBySlug = Object.fromEntries(
  COURSE_CATALOG.map((course) => [course.slug, course]),
) as Record<string, CourseSummary>;

function inferCourseTools(course: CourseSummary) {
  const title = course.title.toLowerCase();

  if (title.includes('flutter') || title.includes('app development')) {
    return ['Flutter', 'Dart', 'Firebase', 'UI components'];
  }

  if (title.includes('video') || title.includes('capcut')) {
    return ['CapCut', 'Phone editing workflow', 'Storyboarding', 'Export settings'];
  }

  if (title.includes('youtube')) {
    return ['YouTube Studio', 'Content planning', 'Growth workflow', 'Analytics basics'];
  }

  if (title.includes('cyber')) {
    return ['Security mindset', 'Basic security tools', 'Threat awareness', 'Safe workflow'];
  }

  if (title.includes('verify')) {
    return ['BM workflow', 'Verification checklist', 'Submission process', 'Support guide'];
  }

  if (title.includes('money') || title.includes('ai')) {
    return ['AI tools', 'Prompt workflow', 'Automation basics', 'Offer building'];
  }

  if (title.includes('wordpress')) {
    return ['WordPress', 'Theme setup', 'Plugin workflow', 'Template import'];
  }

  if (title.includes('programming') || title.includes('c programming')) {
    return ['C language basics', 'Compiler setup', 'Coding practice', 'Problem solving'];
  }

  return [course.category, 'Practical workflow', 'Project-based guidance', 'Support notes'];
}

function buildGenericCourseDetail(course: CourseSummary): CourseDetail {
  return {
    ...course,
    language: 'বাংলা',
    heroSummary: `${course.title} কোর্সটি ${course.category} বিষয়ে practicalভাবে শিখে নিজের কাজ, career বা client delivery-তে apply করার জন্য সাজানো হয়েছে।`,
    description: `${course.title} এমনভাবে structure করা হবে যাতে beginner থেকে practical execution পর্যন্ত step-by-step শেখা যায়। আপনি concept, guided practice, support direction এবং repeatable workflow একসাথে পাবেন।`,
    outcomeSummary: `এই কোর্স শেষে আপনি ${course.title} related কাজ confidently শুরু করতে, নিজের skill practice করতে এবং বাস্তব use-case-এ apply করতে পারবেন।`,
    deliverables: [
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Private support group access',
      'Certificate of completion',
    ],
    audience: [
      `${course.title} skill শিখতে চান এমন beginner learner`,
      `freelancer, student বা job holder যারা ${course.category} skill add করতে চান`,
      `যারা practical workflow আর step-by-step Bangla learning format চান`,
    ],
    workflow: [
      'Enroll করার পর lesson flow আর core learning roadmap পাবেন',
      'Step-by-step practice করে নিজের project বা use-case-এ apply করবেন',
      'Support group access ব্যবহার করে output improve করবেন',
    ],
    tools: inferCourseTools(course),
    support: 'Private support group access থাকবে, যাতে learning-এর সময় প্রশ্ন বা stuck point clear করা যায়।',
    certificate: 'Course flow complete করলে certificate of completion দেওয়া হবে।',
    facts: [
      { label: 'অ্যাক্সেস', value: 'Lifetime' },
      { label: 'আপডেট', value: 'Free' },
      { label: 'সাপোর্ট', value: 'Private group' },
      { label: 'সার্টিফিকেট', value: 'Included' },
    ],
    faq: [
      {
        question: 'এই কোর্সে monthly fee আছে কি?',
        answer: 'না, এটি one-time purchase। lifetime access থাকবে।',
      },
      {
        question: 'Future update কি include থাকবে?',
        answer: 'হ্যাঁ, বর্তমান offer অনুযায়ী future update free থাকবে।',
      },
      {
        question: 'Beginner user কি follow করতে পারবে?',
        answer: 'হ্যাঁ, courseটি Bangla step-by-step practical learning flow মাথায় রেখে রাখা হয়েছে।',
      },
    ],
  };
}

const SPECIFIC_COURSE_DETAILS: Record<string, CourseDetailOverrides> = {
  'n8n-automation-mastery': {
    language: 'বাংলা',
    heroSummary:
      'Freelancing, business বা job - ৩০ দিনের ভিতর step-by-step Banglay n8n automation শিখে workflow অটো করতে, সময় বাঁচাতে এবং value বাড়াতে এই কোর্সটি সাজানো হয়েছে।',
    description:
      'n8n Automation Mastery একটি practical automation course যেখানে repeat কাজ অটো করা, client-এর কাছে extra value তৈরি করা এবং portfolio-ready workflow বানানো - এই তিনটি জিনিসকে কেন্দ্র করে শেখানো হবে। শুধু basics না, বরং real-world workflow, agency automation, AI data enrichment, client success system এবং productized service launch পর্যন্ত cover করা হবে।',
    outcomeSummary:
      'এই কোর্স শেষে আপনি নিজের use-case অনুযায়ী n8n workflow plan, build, debug এবং deliver করতে পারবেন; একই সাথে freelancing, agency delivery বা business automation-এর জন্য usable workflow portfolio তৈরি করতে পারবেন।',
    deliverables: [
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Bonus: weekly live Q&A session access',
      'Bangla support',
      'Project-based learning',
      'Private support group access',
      'Certificate of completion',
    ],
    audience: [
      'Freelancers যারা Upwork/Fiverr-এ automation service দিয়ে আলাদা হতে চান',
      'Business owners যারা repetitive কাজ অটোমেট করে time ও cost save করতে চান',
      'Agency owners যারা client delivery pipeline automate করে margin ও retention বাড়াতে চান',
      'Sales বা marketing team যারা lead capture, sync এবং reporting automate করতে চান',
      'Beginner learner বা career switcher যারা automation-এ practicalভাবে ঢুকতে চান',
    ],
    workflow: [
      'Enroll করার পর step-by-step lesson flow ধরে n8n basics থেকে pro workflow পর্যন্ত শিখবেন',
      'Instant access পেয়ে private group-এ join করে real-world workflow build এবং test করবেন',
      'Learn & Earn flow-এ portfolio-ready automation বানিয়ে client বা business use-case-এ apply করবেন',
    ],
    tools: ['n8n', 'Google Sheets', 'CRM integrations', 'OpenAI', 'Webhooks', 'Reporting dashboard tools'],
    support:
      'Weekly live Q&A session, private support group এবং Bangla step-by-step guidance থাকবে, যাতে beginner হলেও stuck point clear করা যায়।',
    certificate: 'কোর্সের মূল flow complete করলে Deshi Course থেকে certificate of completion পাবেন।',
    facts: [
      { label: 'সময়', value: '৩০ দিন' },
      { label: 'সাপোর্ট', value: 'Bangla' },
      { label: 'স্টাইল', value: 'Project-based' },
      { label: 'বোনাস', value: 'Weekly Q&A' },
    ],
    faq: [
      {
        question: 'এই কোর্সে কী ধরনের workflow শিখব?',
        answer: 'n8n basics, real-world workflows, freelancing workflow, agency automation, AI + data enrichment এবং client success system-এর মতো practical area cover করা হবে।',
      },
      {
        question: 'Beginner হলেও কি এই course follow করা যাবে?',
        answer: 'হ্যাঁ। Source page-এ এটি Bangla step-by-step practical learning হিসেবে positioned, তাই শুরু থেকে workflow logic ধরেই শেখানো হবে।',
      },
      {
        question: 'Freelancing বা client work-এর জন্য useful হবে?',
        answer: 'হ্যাঁ। শেখার অংশে automation service, Upwork/Fiverr strategy, client onboarding, reminder automation এবং retention flow-এর মতো use-case দেখানো হয়েছে।',
      },
    ],
  },
  'vibe-coding-mastery': {
    language: 'বাংলা',
    heroSummary:
      'Freelancing, business বা job - ৩০ দিনের ভিতর step-by-step Banglay AI-assisted coding শিখে দ্রুত prototype, ship এবং deliver করতে চাইলে এই Vibe Coding Mastery course আপনার জন্য।',
    description:
      'Vibe Coding Mastery-তে শুধু prompt লেখা না, বরং idea থেকে scope define করা, rapid UI build, backend/API glue, workflow bridge, AI agents/data, client success system এবং launch & monetize - এই পুরো build flow শেখানো হবে। Source page অনুযায়ী এটি এমনভাবে সাজানো হয়েছে যাতে learner দ্রুত live demo, portfolio-ready project এবং client-facing delivery workflow বানাতে পারে।',
    outcomeSummary:
      'এই কোর্স শেষে আপনি AI-assisted workflow দিয়ে দ্রুত landing page, dashboard, mini tool বা MVP build করতে পারবেন; prompt-to-code iteration, delivery workflow এবং monetization-ready execution flow-ও ধরতে পারবেন।',
    deliverables: [
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Bonus: weekly live Q&A + build review',
      'AI-assisted builds',
      'Bangla support',
      'Project-based shipping',
      'Private support group access',
      'Certificate of completion',
    ],
    audience: [
      'Freelancers যারা Upwork/Fiverr-এ দ্রুত delivery দিয়ে আলাদা হতে চান',
      'Students যারা portfolio-ready project বানিয়ে job market-এ edge চান',
      'Business owner বা solo maker যারা internal tool, landing page বা MVP দ্রুত ship করতে চান',
      'Agency owner যারা client delivery pipeline faster করতে চান',
      'Designer, developer বা career switcher যারা design-to-code bridge এবং AI-assisted build শিখতে চান',
    ],
    workflow: [
      'Enroll করার পর prompt, build system এবং course toolkit access পাবেন',
      'Instant toolkit access নিয়ে prompt + project flow ব্যবহার করে prototype, landing বা tool build করবেন',
      'Build & Ship phase-এ publish, review এবং delivery workflow practice করবেন',
    ],
    tools: ['Anthropic', 'GitHub', 'Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Vercel'],
    support:
      'Weekly live Q&A + build review, prompt library support direction এবং private group feedback থাকবে যাতে build confusion দ্রুত clear করা যায়।',
    certificate: 'Course flow complete করলে certificate of completion দেওয়া হবে।',
    facts: [
      { label: 'সময়', value: '৩০ দিন' },
      { label: 'সাপোর্ট', value: 'Bangla' },
      { label: 'স্টাইল', value: 'Project-based shipping' },
      { label: 'বোনাস', value: 'Build review' },
    ],
    faq: [
      {
        question: 'এই course-এ UI আর frontend build শিখানো হবে?',
        answer: 'হ্যাঁ। Source page-এ Rapid UI & Frontend section-এ landing page, dashboard, component system এবং design-to-code workflow explicitly দেখানো আছে।',
      },
      {
        question: 'Backend বা API integration cover আছে?',
        answer: 'হ্যাঁ। Backend & API Glue, Workflow Bridge এবং AI Agents & Data sections-এ API integration, auth, forms, data flow, webhook এবং knowledge-base related topic উল্লেখ আছে।',
      },
      {
        question: 'Client delivery বা monetization angle-ও আছে?',
        answer: 'হ্যাঁ। Client Success System এবং Launch & Monetize section-এ scope control, handoff, documentation, pricing, offers এবং inbound leads playbook-এর মতো বিষয় আছে।',
      },
    ],
  },
};

export const COURSE_DETAILS: CourseDetail[] = COURSE_CATALOG.map((course) => ({
  ...buildGenericCourseDetail(course),
  ...SPECIFIC_COURSE_DETAILS[course.slug],
}));

export const getCourseBySlug = (slug: string) =>
  COURSE_DETAILS.find((course) => course.slug === slug);

export const getCourseCardBySlug = (slug: string) =>
  COURSE_CATALOG.find((course) => course.slug === slug);
