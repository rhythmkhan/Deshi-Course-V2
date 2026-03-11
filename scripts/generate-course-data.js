const fs = require('fs');
const path = require('path');

const courses = [
  ['pmp-certification-bootcamp', 'পিএমপি সার্টিফিকেশন বুটক্যাম্প', 'প্রজেক্ট ম্যানেজমেন্ট', 'advanced', 35, 42, 25.55, 'pmp-cert', 'জনপ্রিয়', '30 live class', '1000 practice question', true, 45],
  ['search-engine-optimization', 'সার্চ ইঞ্জিন অপ্টিমাইজেশান', 'ডিজিটাল মার্কেটিং', 'intermediate', 28, 36, 35.0, 'seo-cert', '', 'Google Search Console mastery', '5 live SEO project', false, 0],
  ['scrum-master-certification', 'স্ক্রাম মাস্টার সার্টিফিকেশন', 'এজাইল ও স্ক্রাম', 'intermediate', 24, 30, 70.0, 'scrum-cert', '', 'Agile sprint workshop', '10 real case study', true, 80],
  ['full-stack-web-development', 'ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট', 'ওয়েব ডেভেলপমেন্ট', 'advanced', 48, 64, 55.0, 'web', '', '3 portfolio project', 'Career-focused roadmap', false, 0],
  ['ui-ux-design-masterclass', 'ইউআই/ইউএক্স ডিজাইন মাস্টারক্লাস', 'ডিজাইন', 'intermediate', 32, 40, 32.0, 'uiux', '', 'Figma design system', 'Case study review', false, 0],
  ['digital-marketing-a-to-z', 'ডিজিটাল মার্কেটিং এ টু জেড', 'ডিজিটাল মার্কেটিং', 'beginner', 36, 44, 29.0, 'marketing', '', 'Meta + Google ads basics', 'Campaign reporting', false, 0],
  ['python-for-beginners', 'পাইথন প্রোগ্রামিং ফর বিগিনার্স', 'প্রোগ্রামিং', 'beginner', 30, 38, 22.0, 'python', '', 'Hands-on coding lab', 'Mini automation project', false, 0],
  ['data-science-with-r', 'ডাটা সায়েন্স উইথ আর', 'ডাটা সায়েন্স', 'intermediate', 34, 41, 39.0, 'datascience', '', 'Exploratory analysis', 'Dataset case study', false, 0],
  ['graphic-design-pro', 'গ্রাফিক ডিজাইন প্রো', 'ডিজাইন', 'beginner', 26, 34, 24.0, 'graphic', '', 'Brand identity practice', 'Client-ready assets', false, 0],
  ['flutter-mobile-app-development', 'মোবাইল অ্যাপ ডেভেলপমেন্ট (ফ্লাটার)', 'মোবাইল ডেভেলপমেন্ট', 'intermediate', 42, 56, 48.0, 'mobile', '', 'Cross-platform app build', 'Firebase integration', false, 0],
  ['cyber-security-essentials', 'সাইবার সিকিউরিটি এসেনশিয়ালস', 'সাইবার সিকিউরিটি', 'beginner', 22, 28, 31.0, 'cyber', '', 'Security mindset training', 'Threat analysis lab', false, 0],
  ['cloud-computing-with-aws', 'ক্লাউড কম্পিউটিং উইথ এডব্লিউএস', 'ক্লাউড কম্পিউটিং', 'intermediate', 38, 46, 58.0, 'cloud', '', 'AWS core services', 'Deployment workshop', false, 0],
  ['artificial-intelligence-fundamentals', 'আর্টিফিশিয়াল ইন্টেলিজেন্স ফান্ডামেন্টালস', 'এআই', 'beginner', 20, 26, 27.0, 'ai', '', 'AI workflow overview', 'Mini model case study', false, 0],
  ['javascript-algorithms-and-data-structures', 'জাভাস্ক্রিপ্ট অ্যালগরিদম ও ডাটা স্ট্রাকচার', 'প্রোগ্রামিং', 'intermediate', 28, 39, 26.0, 'js', '', 'Problem solving drills', 'Interview prep set', false, 0],
  ['content-writing-masterclass', 'কনটেন্ট রাইটিং মাস্টারক্লাস', 'কনটেন্ট', 'beginner', 18, 24, 19.0, 'writing', '', 'Article structure system', 'Portfolio writing sprint', false, 0],
  ['video-editing-with-premiere-pro', 'ভিডিও এডিটিং উইথ প্রিমিয়ার প্রো', 'ভিডিও এডিটিং', 'beginner', 24, 31, 28.0, 'video', '', 'Timeline editing practice', 'Short-form reel project', false, 0],
  ['business-communication-skills', 'বিজনেস কমিউনিকেশন স্কিলস', 'বিজনেস', 'beginner', 16, 22, 17.0, 'business', '', 'Email and meeting skill', 'Presentation practice', false, 0],
  ['project-management-professional', 'প্রজেক্ট ম্যানেজমেন্ট প্রফেশনাল', 'প্রজেক্ট ম্যানেজমেন্ট', 'advanced', 30, 36, 44.0, 'pmp2', '', 'Project charter workshop', 'Stakeholder management', false, 0],
  ['ecommerce-business-guide', 'ই-কমার্স বিজনেস গাইড', 'ই-কমার্স', 'beginner', 18, 23, 21.0, 'ecommerce', '', 'Store setup blueprint', 'Growth checklist', false, 0],
  ['advanced-excel-for-business', 'অ্যাডভান্সড এক্সেল ফর বিজনেস', 'বিজনেস', 'intermediate', 20, 27, 23.0, 'excel', '', 'Formula and dashboard lab', 'Reporting workflow', false, 0],
  ['public-speaking-and-presentation', 'পাবলিক স্পিকিং ও প্রেজেন্টেশন', 'সফট স্কিল', 'beginner', 14, 20, 16.0, 'speaking', '', 'Confidence-building exercise', 'Presentation script review', false, 0],
  ['financial-management', 'ফাইন্যান্সিয়াল ম্যানেজমেন্ট', 'ফাইন্যান্স', 'intermediate', 26, 32, 34.0, 'finance', '', 'Budgeting framework', 'Business finance case', false, 0],
  ['software-testing-and-quality-assurance', 'সফটওয়্যার টেস্টিং ও কোয়ালিটি অ্যাসুরেন্স', 'সফটওয়্যার টেস্টিং', 'intermediate', 24, 33, 25.0, 'testing', '', 'Manual + QA workflow', 'Bug reporting lab', false, 0],
  ['blockchain-technology-fundamentals', 'ব্লকচেইন টেকনোলজি ফান্ডামেন্টালস', 'ব্লকচেইন', 'beginner', 18, 24, 27.0, 'blockchain', '', 'Core blockchain concepts', 'Web3 overview', false, 0],
  ['photography-masterclass', 'ফটোগ্রাফি মাস্টারক্লাস', 'ফটোগ্রাফি', 'beginner', 20, 26, 22.0, 'photo', '', 'Lighting and framing', 'Editing workflow', false, 0],
  ['sales-and-negotiation-skills', 'সেলস ও নেগোসিয়েশন স্কিলস', 'বিজনেস', 'intermediate', 18, 25, 19.0, 'sales', '', 'Sales call practice', 'Negotiation framework', false, 0],
  ['leadership-and-team-management', 'লিডারশিপ ও টিম ম্যানেজমেন্ট', 'ম্যানেজমেন্ট', 'intermediate', 22, 28, 24.0, 'leader', '', 'Team leadership playbook', 'Manager feedback loop', false, 0],
  ['personal-branding-guide', 'পার্সোনাল ব্র্যান্ডিং গাইড', 'ক্যারিয়ার', 'beginner', 12, 18, 15.0, 'brand', '', 'LinkedIn profile plan', 'Personal positioning', false, 0],
  ['time-management-and-productivity', 'টাইম ম্যানেজমেন্ট ও প্রোডাক্টিভিটি', 'প্রোডাক্টিভিটি', 'beginner', 10, 16, 12.0, 'time', '', 'Weekly planning system', 'Deep work routine', false, 0],
  ['entrepreneurship-101', 'এন্টারপ্রেনারশিপ ১০১', 'স্টার্টআপ', 'beginner', 16, 21, 18.0, 'ent', '', 'Business model canvas', 'Launch checklist', false, 0],
];

const levelMap = {
  beginner: 'বিগিনার',
  intermediate: 'ইন্টারমিডিয়েট',
  advanced: 'অ্যাডভান্সড',
};

const categoryThemes = {
  'প্রজেক্ট ম্যানেজমেন্ট': {
    audience: ['aspiring project manager', 'team lead', 'operations executive'],
    tools: ['Jira', 'Trello', 'MS Project'],
    goals: ['project planning', 'risk management', 'stakeholder alignment'],
  },
  'ডিজিটাল মার্কেটিং': {
    audience: ['marketing executive', 'freelancer', 'business owner'],
    tools: ['Google Analytics', 'Search Console', 'Meta Ads Manager'],
    goals: ['campaign setup', 'performance tracking', 'content strategy'],
  },
  'এজাইল ও স্ক্রাম': {
    audience: ['project coordinator', 'scrum team member', 'product owner aspirant'],
    tools: ['Jira', 'Confluence', 'Miro'],
    goals: ['sprint planning', 'backlog management', 'team ceremony facilitation'],
  },
  'ওয়েব ডেভেলপমেন্ট': {
    audience: ['career switcher', 'student developer', 'freelancer'],
    tools: ['HTML/CSS', 'JavaScript', 'React'],
    goals: ['frontend build', 'backend integration', 'deployment workflow'],
  },
  'ডিজাইন': {
    audience: ['aspiring designer', 'freelancer', 'content creator'],
    tools: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator'],
    goals: ['visual hierarchy', 'portfolio-ready layout', 'client presentation'],
  },
  'প্রোগ্রামিং': {
    audience: ['beginner coder', 'job seeker', 'CS student'],
    tools: ['VS Code', 'Git', 'Terminal'],
    goals: ['problem solving', 'syntax mastery', 'project building'],
  },
  'ডাটা সায়েন্স': {
    audience: ['analyst', 'researcher', 'math-focused learner'],
    tools: ['RStudio', 'Jupyter', 'Excel'],
    goals: ['data cleaning', 'visualization', 'insight reporting'],
  },
  'মোবাইল ডেভেলপমেন্ট': {
    audience: ['app developer', 'student', 'startup founder'],
    tools: ['Flutter', 'Dart', 'Firebase'],
    goals: ['ui build', 'state management', 'mobile deployment'],
  },
  'সাইবার সিকিউরিটি': {
    audience: ['IT professional', 'network admin', 'security enthusiast'],
    tools: ['Wireshark', 'Nmap', 'OWASP resources'],
    goals: ['threat awareness', 'security audit', 'incident basics'],
  },
  'ক্লাউড কম্পিউটিং': {
    audience: ['devops learner', 'backend developer', 'IT admin'],
    tools: ['AWS Console', 'EC2', 'S3'],
    goals: ['cloud architecture', 'deployment', 'service monitoring'],
  },
  'এআই': {
    audience: ['AI beginner', 'student', 'product builder'],
    tools: ['Python notebooks', 'AI APIs', 'Prompt workspace'],
    goals: ['AI concepts', 'prompt workflow', 'use-case validation'],
  },
  'কনটেন্ট': {
    audience: ['writer', 'marketer', 'student'],
    tools: ['Google Docs', 'Notion', 'Grammarly'],
    goals: ['structure', 'clarity', 'publishing consistency'],
  },
  'ভিডিও এডিটিং': {
    audience: ['content creator', 'editor', 'freelancer'],
    tools: ['Premiere Pro', 'CapCut', 'After Effects basics'],
    goals: ['editing pace', 'story flow', 'export workflow'],
  },
  'বিজনেস': {
    audience: ['professional', 'sales executive', 'entrepreneur'],
    tools: ['Excel', 'Slides', 'CRM basics'],
    goals: ['communication', 'reporting', 'decision making'],
  },
  'ই-কমার্স': {
    audience: ['small business owner', 'online seller', 'freelancer'],
    tools: ['Shopify', 'Facebook Page', 'Canva'],
    goals: ['store setup', 'product listing', 'growth plan'],
  },
  'সফট স্কিল': {
    audience: ['student', 'job seeker', 'team member'],
    tools: ['Slides', 'Voice notes', 'Camera recording'],
    goals: ['confidence', 'delivery', 'clarity'],
  },
  'ফাইন্যান্স': {
    audience: ['account officer', 'manager', 'business owner'],
    tools: ['Excel', 'Google Sheets', 'Financial templates'],
    goals: ['budgeting', 'analysis', 'financial decision'],
  },
  'সফটওয়্যার টেস্টিং': {
    audience: ['QA aspirant', 'developer', 'manual tester'],
    tools: ['Jira', 'Postman', 'TestRail'],
    goals: ['bug tracking', 'test case writing', 'quality mindset'],
  },
  'ব্লকচেইন': {
    audience: ['tech enthusiast', 'developer', 'startup learner'],
    tools: ['MetaMask', 'Etherscan', 'Smart contract basics'],
    goals: ['blockchain concepts', 'web3 overview', 'real-world use cases'],
  },
  'ফটোগ্রাফি': {
    audience: ['photography beginner', 'creator', 'freelancer'],
    tools: ['DSLR basics', 'Lightroom', 'Mobile camera'],
    goals: ['composition', 'lighting', 'editing'],
  },
  'ম্যানেজমেন্ট': {
    audience: ['team lead', 'supervisor', 'manager aspirant'],
    tools: ['Notion', 'Google Sheets', '1:1 template'],
    goals: ['leadership', 'feedback', 'team coordination'],
  },
  'ক্যারিয়ার': {
    audience: ['job seeker', 'student', 'young professional'],
    tools: ['LinkedIn', 'CV template', 'Portfolio page'],
    goals: ['personal positioning', 'networking', 'career visibility'],
  },
  'প্রোডাক্টিভিটি': {
    audience: ['busy professional', 'student', 'founder'],
    tools: ['Calendar', 'Notion', 'Task manager'],
    goals: ['focus', 'planning', 'routine building'],
  },
  'স্টার্টআপ': {
    audience: ['founder aspirant', 'student entrepreneur', 'small business owner'],
    tools: ['Lean canvas', 'Google Sheets', 'Pitch deck'],
    goals: ['validation', 'positioning', 'launch planning'],
  },
};

const fallbackTheme = {
  audience: ['learner', 'professional', 'career switcher'],
  tools: ['Google Docs', 'Slides', 'Templates'],
  goals: ['practical workflow', 'portfolio improvement', 'career growth'],
};

const levelLabel = (level) => levelMap[level] || 'ইন্টারমিডিয়েট';
const price = (value) => Number(value.toFixed(2));

const buildSummary = (course, index) => {
  const [slug, title, category, level, duration, lessons, amount, imageSeed, tag, metricA, metricB, isOwned, progress] = course;
  return {
    id: index + 1,
    slug,
    title,
    category,
    level,
    durationWeeks: Math.max(6, Math.round(duration / 4)),
    totalHours: duration,
    totalLessons: lessons,
    price: price(amount),
    originalPrice: price(amount * 1.35),
    image: `https://picsum.photos/seed/${imageSeed}/1200/800`,
    instructor: 'দেশি কোর্স দল',
    tag,
    featureMetrics: [metricA, metricB],
    isOwned,
    progress,
  };
};

const summaries = courses.map(buildSummary);

const buildDetail = (summary, index) => {
  const theme = categoryThemes[summary.category] || fallbackTheme;
  const capTitle = summary.title;
  const weeks = summary.durationWeeks;
  const baseStudents = 1400 + index * 135;
  return {
    ...summary,
    students: baseStudents,
    rating: price(4.6 + ((index % 3) * 0.1)),
    reviews: 180 + index * 17,
    language: 'বাংলা',
    support: 'লাইভ সাপোর্ট, কমিউনিটি গ্রুপ, রেকর্ডেড রিভিশন ক্লাস',
    certificate: 'কোর্স সফলভাবে শেষ করলে দেশি কোর্স থেকে সার্টিফিকেট পাবেন।',
    heroSummary: `${capTitle} কোর্সটি ${theme.audience[0]} থেকে ${theme.audience[2]} পর্যন্ত সবার জন্য এমনভাবে ডিজাইন করা হয়েছে যাতে শুরু থেকে শেষ পর্যন্ত একটি পরিষ্কার roadmap, mentor support এবং real-world practice পাওয়া যায়।`,
    description: `${capTitle} হলো একটি hands-on, cohort-style learning program যেখানে concept, guided practice, assignments, mock review এবং career-ready execution - এই পাঁচটি স্তর ধরে আপনাকে এগিয়ে নেওয়া হবে।`,
    requirements: [
      'কমপক্ষে সপ্তাহে ৪-৫ ঘণ্টা সময় দিতে পারলে সবচেয়ে ভালো ফল পাবেন।',
      'ইন্টারনেট সংযোগ এবং একটি ল্যাপটপ বা ডেস্কটপ থাকলে সবকিছু সহজ হবে।',
      'নিয়মিত practice, assignment submission এবং mentor feedback গ্রহণের মানসিকতা থাকতে হবে।',
    ],
    tools: theme.tools,
    audience: [
      `${theme.audience[0]} যারা structured roadmap চান`,
      `${theme.audience[1]} যারা practical skill বাড়াতে চান`,
      `${theme.audience[2]} যারা job, freelance বা promotion-ready হতে চান`,
    ],
    outcomes: [
      `${theme.goals[0]}-এ confident workflow তৈরি করতে পারবেন`,
      `${theme.goals[1]}-ভিত্তিক একটি practical project বা case study সম্পন্ন করবেন`,
      `${theme.goals[2]}-এর জন্য প্রয়োজনীয় checklist, template এবং best practice শিখবেন`,
      'নিজের skill explain, showcase এবং real-world use-case-এ apply করতে পারবেন',
    ],
    curriculum: [
      {
        title: 'মডিউল ১: ফাউন্ডেশন ও রোডম্যাপ',
        lessons: [
          `${summary.category} ইন্ডাস্ট্রি overview`,
          'কোর্স setup, tools এবং learning system',
          'skill roadmap ও weekly success plan',
        ],
      },
      {
        title: 'মডিউল ২: কোর স্কিল বিল্ডিং',
        lessons: [
          `${theme.goals[0]} fundamentals`,
          `${theme.goals[1]}-এর core process`,
          'practice drills ও guided examples',
        ],
      },
      {
        title: 'মডিউল ৩: প্রজেক্ট, রিভিউ ও execution',
        lessons: [
          'assignment walkthrough',
          'mentor feedback round',
          'final portfolio/case-study delivery',
        ],
      },
      {
        title: 'মডিউল ৪: ক্যারিয়ার ও next steps',
        lessons: [
          'CV/portfolio positioning',
          'interview বা client communication prep',
          'next 90-day skill growth plan',
        ],
      },
    ],
    faq: [
      {
        question: 'এই কোর্সটি কার জন্য সবচেয়ে উপযোগী?',
        answer: `যারা ${summary.category} স্কিলে structuredভাবে শিখে practical outcome চান, তাদের জন্য এই কোর্সটি সবচেয়ে উপযোগী।`,
      },
      {
        question: 'কোর্সটি শেষ করতে কত সময় লাগবে?',
        answer: `গড়ে ${weeks} সপ্তাহের guided plan ধরা হয়েছে, তবে আপনি নিজের গতিতে revision করতে পারবেন।`,
      },
      {
        question: 'লাইভ সাপোর্ট বা মেন্টর ফিডব্যাক কি থাকবে?',
        answer: 'হ্যাঁ, selected live session, Q&A support এবং assignment feedback system রয়েছে।',
      },
      {
        question: 'সার্টিফিকেট কি দেওয়া হবে?',
        answer: 'হ্যাঁ, final assessment ও required assignment complete করলে certificate পাবেন।',
      },
    ],
  };
};

const details = summaries.map(buildDetail);

const toTs = (value) =>
  JSON.stringify(value, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"([^"]*)"/g, (match, inner) => `'${inner.replace(/'/g, "\\'")}'`);

const catalogTs = `export interface CourseSummary {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  totalHours: number;
  totalLessons: number;
  price: number;
  originalPrice: number;
  image: string;
  instructor: string;
  tag: string;
  featureMetrics: string[];
  isOwned: boolean;
  progress: number;
}

export const COURSE_CATALOG: CourseSummary[] = ${toTs(summaries)} as CourseSummary[];

export const FEATURED_COURSES = COURSE_CATALOG.slice(0, 3);
`;

const detailsTs = `import { COURSE_CATALOG, type CourseSummary } from './course-catalog';

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface CourseCurriculumSection {
  title: string;
  lessons: string[];
}

export interface CourseDetail extends CourseSummary {
  students: number;
  rating: number;
  reviews: number;
  language: string;
  support: string;
  certificate: string;
  heroSummary: string;
  description: string;
  requirements: string[];
  tools: string[];
  audience: string[];
  outcomes: string[];
  curriculum: CourseCurriculumSection[];
  faq: CourseFaq[];
}

export const COURSE_DETAILS: CourseDetail[] = ${toTs(details)} as CourseDetail[];

export const getCourseBySlug = (slug: string) =>
  COURSE_DETAILS.find((course) => course.slug === slug);

export const getCourseCardBySlug = (slug: string) =>
  COURSE_CATALOG.find((course) => course.slug === slug);
`;

fs.mkdirSync(path.join(process.cwd(), 'lib'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'lib', 'course-catalog.ts'), catalogTs);
fs.writeFileSync(path.join(process.cwd(), 'lib', 'course-details.ts'), detailsTs);
console.log(`Generated ${summaries.length} course summaries and ${details.length} course details.`);
