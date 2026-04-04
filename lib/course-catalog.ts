import { buildCatalogArt, type CatalogArtTheme } from './catalog-art';

export interface CourseSummary {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  originalPrice: number;
  image: string;
  instructor: string;
  accessLabel: string;
  tag: string;
  promoTag?: string;
  featureMetrics: string[];
  isOwned: boolean;
  progress: number;
}

const COURSE_IMAGE_BY_SLUG: Record<string, string> = {
  'n8n-automation-mastery': '/images/courses/n8n-automation-mastery.webp',
  'vibe-coding-mastery': '/images/courses/vibe-coding-mastery.webp',
  'phone-ai-video-editing': '/images/courses/phone-ai-video-editing.webp',
  'capcut-pc-video-editing': '/images/courses/capcut-pc-video-editing.webp',
  'ai-money-making-mastery': '/images/courses/ai-money-making-mastery.webp',
  'cyber-security': '/images/courses/cyber-security.webp',
  'chinese-product-business-formula': '/images/courses/chinese-product-business-formula.webp',
  'youtube-automation-growth-mastery-course': '/images/courses/youtube-automation-growth-mastery-course.webp',
  'app-development-with-flutter': '/images/courses/app-development-with-flutter.webp',
  'video-editing-course-rafayat-rakib': '/images/courses/video-editing-course-rafayat-rakib.webp',
  'video-editing-storytelling-voice-of-dhaka': '/images/courses/video-editing-storytelling-voice-of-dhaka.webp',
  '10ms-sohoj-vashay-c-programming': '/images/courses/10ms-sohoj-vashay-c-programming.webp',
  'bohubrihi-app-development': '/images/courses/bohubrihi-app-development.webp',
  'passive-ai-money-machines': '/images/courses/passive-ai-money-machines.webp',
  'youtube-automation-course': '/images/courses/youtube-automation-course.webp',
  'business-manager-verify': '/images/courses/business-manager-verify.webp',
};

function createCourse(
  id: number,
  title: string,
  slug: string,
  category: string,
  level: CourseSummary['level'],
  theme: CatalogArtTheme,
) {
  return {
    id,
    slug,
    title,
    category,
    level,
    price: 99,
    originalPrice: 99,
    image: COURSE_IMAGE_BY_SLUG[slug] ?? buildCatalogArt(title, theme, 'Course'),
    instructor: 'দেশি কোর্স',
    accessLabel: 'Lifetime access',
    tag: 'নতুন',
    featureMetrics: [
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Private support group access',
    ],
    isOwned: false,
    progress: 0,
  } satisfies CourseSummary;
}

export const COURSE_CATALOG: CourseSummary[] = [
  {
    id: 1,
    slug: 'n8n-automation-mastery',
    title: 'n8n Automation Mastery',
    category: 'এআই ও অটোমেশন',
    level: 'intermediate',
    price: 299,
    originalPrice: 299,
    image: COURSE_IMAGE_BY_SLUG['n8n-automation-mastery'],
    instructor: 'দেশি কোর্স',
    accessLabel: 'Lifetime access',
    tag: 'নতুন',
    promoTag: 'Free hosting',
    featureMetrics: [
      'n8n basics থেকে pro workflow',
      'Real-world workflow build practice',
      'Weekly live Q&A session access',
      'Private support group access',
      'Offer থাকা পর্যন্ত ১ মাস free hosting',
      'Freelancing-ready automation skill',
    ],
    isOwned: false,
    progress: 0,
  },
  {
    id: 2,
    slug: 'vibe-coding-mastery',
    title: 'Vibe Coding Mastery',
    category: 'এআই ও অটোমেশন',
    level: 'intermediate',
    price: 299,
    originalPrice: 299,
    image: COURSE_IMAGE_BY_SLUG['vibe-coding-mastery'],
    instructor: 'দেশি কোর্স',
    accessLabel: 'Lifetime access',
    tag: 'নতুন',
    promoTag: 'Access first!',
    featureMetrics: [
      'Lifetime access, কোনো monthly fee নাই',
      'All future updates free',
      'Weekly live Q&A + build review',
      'Private support group access',
    ],
    isOwned: false,
    progress: 0,
  },
  {
    ...createCourse(3, 'Phone AI Video Editing', 'phone-ai-video-editing', 'ভিডিও এডিটিং', 'beginner', 'video'),
    price: 0,
    originalPrice: 0,
    tag: 'ফ্রি',
  },
  createCourse(4, 'Capcut PC Video Editing', 'capcut-pc-video-editing', 'ভিডিও এডিটিং', 'beginner', 'video'),
  createCourse(5, 'AI Money Making Mastery', 'ai-money-making-mastery', 'এআই ও অটোমেশন', 'intermediate', 'money'),
  createCourse(6, 'Cyber Security', 'cyber-security', 'বিজনেস ও সিকিউরিটি', 'beginner', 'security'),
  createCourse(
    7,
    'চাইনিজ পণ্য নিয়ে লাখ টাকার বিস্নেসস ফরমুলা',
    'chinese-product-business-formula',
    'বিজনেস ও সিকিউরিটি',
    'beginner',
    'business',
  ),
  createCourse(
    8,
    'Youtube Automation & Growth Mastery Course',
    'youtube-automation-growth-mastery-course',
    'এআই ও অটোমেশন',
    'intermediate',
    'youtube',
  ),
  createCourse(9, 'App Development with Flutter', 'app-development-with-flutter', 'অ্যাপ ও প্রোগ্রামিং', 'intermediate', 'app'),
  createCourse(10, 'Video Editing Course (Rafayat Rakib)', 'video-editing-course-rafayat-rakib', 'ভিডিও এডিটিং', 'beginner', 'video'),
  createCourse(
    11,
    'Video Editing & Storytelling by Voice of Dhaka',
    'video-editing-storytelling-voice-of-dhaka',
    'ভিডিও এডিটিং',
    'intermediate',
    'video',
  ),
  createCourse(12, '10MS সহজ ভাষায় C Programming', '10ms-sohoj-vashay-c-programming', 'অ্যাপ ও প্রোগ্রামিং', 'beginner', 'code'),
  createCourse(13, 'bohubrihi app development', 'bohubrihi-app-development', 'অ্যাপ ও প্রোগ্রামিং', 'intermediate', 'app'),
  createCourse(14, 'Passive AI Money Machines', 'passive-ai-money-machines', 'এআই ও অটোমেশন', 'intermediate', 'money'),
  createCourse(15, 'Youtube Automation Course', 'youtube-automation-course', 'এআই ও অটোমেশন', 'beginner', 'youtube'),
  createCourse(16, 'Business manager Verify', 'business-manager-verify', 'বিজনেস ও সিকিউরিটি', 'beginner', 'verify'),
];

export const FEATURED_COURSES = COURSE_CATALOG.slice(0, 6);
