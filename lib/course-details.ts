import { COURSE_CATALOG, type CourseSummary } from './course-catalog';

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface CourseFact {
  label: string;
  value: string;
}

export interface CourseModule {
  title: string;
  lessons: string[];
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
  modules?: CourseModule[];
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
      'Freelancing, business বা job - step-by-step Banglay n8n automation শিখে workflow অটো করা, সময় বাঁচানো, client value বাড়ানো এবং portfolio-ready execution build করার জন্য এই কোর্সটি সাজানো হয়েছে।',
    description:
      'n8n Automation Mastery একটি practical automation course যেখানে একই কাজ বারবার করে সময় নষ্ট হওয়া, automation না জানায় client miss হওয়া, আর automation কঠিন মনে হওয়া - এই বাস্তব সমস্যাগুলো solve করার mindset দিয়ে শেখানো হবে। শুধু basics না, বরং n8n basics to pro, real-world workflows, freelancing & earning, agency automation toolkit, AI + data enrichment, client success system এবং productized service launch পর্যন্ত visible use-case ভিত্তিক flow cover করা হবে।',
    outcomeSummary:
      'এই কোর্স শেষে আপনি নিজের use-case অনুযায়ী n8n workflow plan, build, debug এবং deliver করতে পারবেন; একই সাথে lead capture, CRM sync, e-commerce order processing, approval flow, reporting, client onboarding বা support automation-এর মতো কাজের জন্য usable workflow portfolio তৈরি করতে পারবেন।',
    deliverables: [
      'Lifetime access, কোনো monthly fee নাই',
      'n8n setup এবং basic interface পুরোপুরি শেখার structured lesson flow',
      'Node, connection, workflow structure, error handling ও debugging practice',
      'Real-world workflow use-case: lead, CRM, email ও e-commerce automation',
      'Bonus: weekly live Q&A session access',
      'Bangla support ও private support group access',
      'Certificate of completion',
    ],
    audience: [
      'Freelancers যারা Upwork/Fiverr-এ automation service দিয়ে আলাদা হতে চান',
      'Business owners যারা repetitive কাজ অটোমেট করে time ও cost save করতে চান',
      'Agency owners যারা client delivery pipeline automate করে margin ও retention বাড়াতে চান',
      'Sales বা marketing team যারা lead capture, sync এবং reporting automate করতে চান',
      'Ops manager, ecommerce operator, data team বা support team যারা process automation চান',
      'Beginner learner বা career switcher যারা automation-এ practicalভাবে ঢুকতে চান',
    ],
    workflow: [
      'প্রথমে n8n basics to pro flow ধরে setup, interface, node, connection আর workflow structure শিখবেন',
      'তারপর real-world workflow phase-এ lead save, email automation, CRM integration আর e-commerce flow build করবেন',
      'শেষে freelancing, agency toolkit, client success system আর productized service launch angle দিয়ে portfolio-ready automation বানাবেন',
    ],
    tools: ['n8n', 'Google Sheets', 'CRM integrations', 'OpenAI', 'Webhooks', 'Reporting dashboard tools'],
    support:
      'Weekly live Q&A session, private support group এবং Bangla step-by-step guidance থাকবে, যাতে beginner হলেও stuck point clear করা যায় এবং workflow polish করা যায়।',
    certificate: 'কোর্সের মূল flow complete করলে Deshi Course থেকে certificate of completion পাবেন।',
    facts: [
      { label: 'ফোকাস', value: 'Basics to Pro' },
      { label: 'স্টাইল', value: 'Practical workflow' },
      { label: 'মডিউল', value: '13 + Bonus' },
      { label: 'সাপোর্ট', value: 'Bangla + private group' },
    ],
    faq: [
      {
        question: 'এই কোর্সে কী ধরনের workflow শিখব?',
        answer: 'n8n basics, real-world workflows, freelancing workflow, agency automation toolkit, AI + data enrichment, client success system এবং productized service launch-এর মতো practical area cover করা হবে।',
      },
      {
        question: 'Beginner হলেও কি এই course follow করা যাবে?',
        answer: 'হ্যাঁ। এটি Bangla step-by-step practical learning flow হিসেবে সাজানো, তাই setup, interface আর basic workflow logic থেকেই শেখানো হবে।',
      },
      {
        question: 'Freelancing বা client work-এর জন্য useful হবে?',
        answer: 'হ্যাঁ। visible course outline-এ automation service, Upwork/Fiverr strategy, client onboarding, reminder automation, retention flow এবং productized service launch-এর use-case দেখানো হয়েছে।',
      },
    ],
    modules: [
      {
        title: 'Module 1: Fundamentals of n8n',
        lessons: [
          'What Is n8n & How Automation Works',
          'Course Introduction',
          'What Are AI Agents & Why They Matter',
          'Agent vs AI Workflow Explained',
        ],
      },
      {
        title: 'Module 2: n8n Core Fundamentals',
        lessons: [
          'Run n8n on Your Computer',
          'Exploring n8n Dashboard & UI',
          'Understanding JSON & Data Types in n8n',
          'Understanding n8n Triggers',
        ],
      },
      {
        title: 'Module 3: Basic AI Building',
        lessons: [
          'Connecting Your First Integration: Google Auth',
          'Build Your First AI-Powered Workflow',
          'Email Agent: Smart Auto Sender',
          'Gmail Manager: Auto Labeling & Sorting',
          'Daily Motivational Agent',
          'Daily Weather Alert Bot',
          'AI Prompt Enhancer Agent',
          'Webinar Registration + Auto Email System',
          'Import Ready-Made n8n Workflows',
          'Understanding APIs: From Basic to Intermediate',
        ],
      },
      {
        title: 'Module 4: n8n Core Nodes',
        lessons: [
          'Exploring Core Helper Nodes: If, Merge, Switch, etc.',
          'Deep Dive: The Set Node',
          'Output Parser Explained',
          'Handling Multiple Items: Looping in n8n',
          'AI in n8n: The Text Classifier Node',
          'Understanding Memory Keys in n8n',
        ],
      },
      {
        title: 'Module 5: Real-World Project - Business Operations',
        lessons: [
          'System Message Writing Guide & Core Explanation',
          'Project: AI Inventory Management Agent',
          'Project: AI Restaurant Management Agent',
          'Project: AI Voice Calling Agent',
        ],
      },
      {
        title: 'Module 6: Real-World Projects',
        lessons: [
          'Messenger Agent Part 1: Webhook Verification & Setup',
          'Messenger Agent Part 2: Building the First Basic Agent',
          'Messenger Agent Part 3: Tool Calling & Agentic Actions',
          'Messenger Agent Part 4: Full Order Management',
          'Messenger Agent Part 5: AI Agent Sending Images to Customers',
          'Part 6: Straightforward RAG & Live Production Troubleshooting',
          'Messenger Agent Part 7: Adding Image & Voice Message Support',
          'Messenger Agent Part 7: Fraud Detection',
          'Messenger Agent Part 8: Chat Transfer Protocol and Client Dashboard',
          'Vibe API Compute Credits Explained Update',
          'Facebook Autoposting Part 1',
          'Facebook Autoposting Part 2',
          'Facebook Autoposting Part 3',
          'Facebook Autoposting Part 4',
          'Facebook Autoposting Part 5',
          'Facebook Dev App Live Method, Image Analyze with Gemini, WhatsApp Image Webhooks',
          'n8n Update and Vibe Tech Automation Workflow Explained',
          'Project: Facebook Auto-Comment Agent',
          'Messenger Typing Effect, Chat Transfer Protocol, Brutal APIs',
          'Bonus: How to Monetize Your Facebook Comment Agent',
          'Advanced: Integrating WhatsApp',
          'Understanding WhatsApp Official vs Unofficial APIs',
          'WhatsApp Unofficial API: Wasender Integration & Account Connect',
          'WhatsApp Webhook: Echo Bot, Messaging & Media Download',
          'WhatsApp Perplexity API Implementation',
          'Automating WordPress with WooCommerce Webhooks',
          'Fix Feed Webhook',
        ],
      },
      {
        title: 'Module 7: RAG',
        lessons: [
          'How RAG Works',
          'Intro to Vector DB: Pinecone Setup',
          'RAG Chatbot: Simple Explanation and Use Cases',
          'Email Customer Support RAG Agent with Feedback',
        ],
      },
      {
        title: 'Module 8: Advanced Skill - Web & Data Scraping',
        lessons: [
          'Introduction to Data Scraping with n8n',
          'MCP Server: Where to Use',
          'Project: Scraping Leads from Apollo.io',
          'AI ASMR Video Workflow',
        ],
      },
      {
        title: 'Module 9: n8n Updates',
        lessons: [
          'n8n New Data Tables: Import & Use Cases',
        ],
      },
      {
        title: 'Module 10: Vibe',
        lessons: [
          'Bolt/Loveable Vibe Coding Part 1: Todo List',
          'Vibe Coding Part 2',
        ],
      },
      {
        title: 'Module 11: Airtable',
        lessons: [
          'Airtable Connection, Inventory Management, AI Futures',
          'Airtable Interface Building, Omni AI, Form Creation',
        ],
      },
      {
        title: 'Module 12: AI API Keys & Setup',
        lessons: [
          'OpenRouter: Usage & Explanation',
          'OpenAI Billing, API Keys & n8n Connection - Complete Guide',
        ],
      },
      {
        title: 'Module 13: Connecting n8n to Redis & MongoDB',
        lessons: [
          'Advanced: Creating Chat Memory with MongoDB',
          'Redis Chat Memory Connection (Upstash)',
        ],
      },
      {
        title: 'Bonus',
        lessons: [
          'Project: Facebook Messenger Agent',
        ],
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
      { label: 'মডিউল', value: '12' },
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
    modules: [
      {
        title: 'Module 1: Starting with Lovable.dev',
        lessons: [
          'Lovable টুল-এর বেসিক কার্যকারিতা ব্যাখ্যা',
          'Product Requirement Document (PRD) কী এবং কেন দরকার',
          'PRD কীভাবে একটি প্রকল্পের জন্য তৈরি ও সাজানো হয়',
          'PRD আরও পরিষ্কার ও কার্যকর করা',
          'ডেটাবেস স্কিমা ডিজাইন করা',
          'Vibe Coding-এ AI-কে নির্দেশ দিয়ে কোড build করার পদ্ধতি',
        ],
      },
      {
        title: 'Module 2: Build Your First Landing Page',
        lessons: [
          'একটি landing page-এর UI/Frontend তৈরি করার ধাপ',
          'Backend যুক্ত করে page-কে কার্যকরভাবে কাজ করানো',
          'Supabase-এর সাথে connection স্থাপন করা',
          'GitHub-এ project ঠিকভাবে maintain করা',
          'Free hosting-এ project deploy করা',
          'Paid hosting-এ একই project live করা',
        ],
      },
      {
        title: 'Module 3: Starting Complex Ecommerce Site with Lovable.dev',
        lessons: [
          'Ecommerce site তৈরি করার সঠিক ও কার্যকর পদ্ধতি',
          'User authentication (login/registration) setup',
          'Responsive ও fully functional frontend design',
          'পূর্ণাঙ্গ admin dashboard তৈরি',
          'Database তৈরি এবং Supabase-এর সাথে connect',
          'প্রস্তুত ecommerce site live deploy করা',
        ],
      },
      {
        title: 'Module 4: More Aggressive Design',
        lessons: [
          'Design guideline তৈরি',
          'বিভিন্ন design পদ্ধতি ও technique শেখা',
          'উন্নত design tips ও tricks',
        ],
      },
      {
        title: 'Module 5: Next Level Vibe Coding with LMS Sites',
        lessons: [
          'LMS-এর PRD ও database schema তৈরি',
          'LMS site-এর frontend design',
          'Admin ও student dashboard wireframe তৈরি',
          'User authentication ও student dashboard feature যুক্ত করা',
          'Payment gateway integration',
          'LMS build-এর জন্য গুরুত্বপূর্ণ note ও পরামর্শ',
        ],
      },
      {
        title: 'Module 6: Vibe with Demanding Tools',
        lessons: [
          'Project management software তৈরি',
          'Money management software তৈরি',
          'Content calendar app তৈরি',
          'Business growth tracker তৈরি',
          'Inventory management app তৈরি',
        ],
      },
      {
        title: 'Module 7: Get Lifetime Free Hosting',
        lessons: [
          'Landing page-এর জন্য hosting setup',
          'যেকোনো website deploy করা',
          'App বা software host করা',
          'Free hosting-এ custom domain set করা',
        ],
      },
      {
        title: 'Module 8: Base44 Basic to Advance',
        lessons: [
          'Base44 টুল-এর basic পরিচিতি',
          'Prompt engineering-এ ChatGPT, Claude ও Gemini-কে train করা',
          'একটি নতুন landing page তৈরি',
          'একটি সম্পূর্ণ agency site তৈরি',
          'Freelancer বা agency-এর জন্য micro CRM তৈরি',
          'Coaching center management app তৈরি',
        ],
      },
      {
        title: 'Module 9: Bolt AI & Cursor AI',
        lessons: [
          'ChatGPT ও Claude-কে train করা',
          'Local school / madrasa management software তৈরি',
          'Donation & funds management software তৈরি',
          'Small business POS management software তৈরি',
          'Business expense + cashflow tracker তৈরি',
        ],
      },
      {
        title: 'Module 10: Client Ready Portfolio',
        lessons: [
          'Portfolio site তৈরি',
          'Personal branding গঠন',
          'একটি team তৈরি ও manage করা',
          'Team management-এর পদ্ধতি শেখা',
          'Leadership skills উন্নত করা',
          'Sustain & grow strategy',
        ],
      },
      {
        title: 'Module 11: Start Earning',
        lessons: [
          'Local freelancing market বুঝা',
          'Freelance marketplace-এর নিয়ম এবং সুযোগ',
          'Remote job opportunities-এর পথ',
          'বিনা খরচে clients পাওয়া strategy',
        ],
      },
      {
        title: 'Module 12: Passive Earning',
        lessons: [
          'Passive earning product 1 (SaaS idea 1) রূপায়ণ',
          'SaaS idea 2 দিয়ে entrepreneur problem solve করা',
          'SaaS idea 3-এর পরিকল্পনা ও নির্মাণ',
          'Ultimate SaaS idea 4-এর বাস্তবায়ন',
        ],
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
