import { BUNDLE_CATALOG } from './bundle-catalog';
import { getBundleDetailBySlug } from './bundle-details';
import { COURSE_DETAILS } from './course-details';
import { getAllProductDetailSlugs, getProductDetailBySlug } from './product-details';

interface GeneratedBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
  tags: string[];
}

const AUTHOR_NAME = 'দেশি কোর্স কনটেন্ট টিম';
const BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const toBanglaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);

const renderList = (items: string[], ordered = false) => {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
};

const renderFaq = (items: Array<{ question: string; answer: string }>) =>
  items
    .map(
      (item) =>
        `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`,
    )
    .join('');

const renderCta = (url: string, label: string, actionLabel: string) => `
  <h2>এখন পরের ধাপ কী</h2>
  <p>আপনি যদি ${escapeHtml(label)} নিয়ে সিরিয়াসভাবে skill build, execution বা delivery শুরু করতে চান, তাহলে পরের best step হলো full offer detail দেখে নেওয়া।</p>
  <p><a href="${url}">${escapeHtml(actionLabel)}</a> দেখে lifetime access, roadmap, support আর bonusগুলো মিলিয়ে সিদ্ধান্ত নিন।</p>
`;

function formatBanglaDate(offset: number) {
  const date = new Date(2026, 2, 11);
  date.setDate(date.getDate() - offset);
  return `${toBanglaNumber(date.getDate())} ${BANGLA_MONTHS[date.getMonth()]}, ${toBanglaNumber(date.getFullYear())}`;
}

function uniqueTags(tags: string[]) {
  return [...new Set(tags.filter(Boolean))];
}

const coursePostVariants = [
  {
    slugSuffix: 'ki-kader-jonno',
    title: (course: (typeof COURSE_DETAILS)[number]) =>
      `${course.title} কী, কাদের জন্য, আর কেন এখন শেখা উচিত`,
    excerpt: (course: (typeof COURSE_DETAILS)[number]) =>
      `${course.title} কোর্সে কী আছে, কাদের জন্য useful, আর skill build করতে কেন এখনই শুরু করা উচিত - তার practical overview।`,
    content: (course: (typeof COURSE_DETAILS)[number]) => `
      <h2>${escapeHtml(course.title)} কেন এখন গুরুত্বপূর্ণ</h2>
      <p>${escapeHtml(course.heroSummary)}</p>
      <h2>এই কোর্সে আপনি কী কী পাবেন</h2>
      ${renderList(course.deliverables.slice(0, 5).map(escapeHtml))}
      <h2>কাদের জন্য এই কোর্স</h2>
      ${renderList(course.audience.slice(0, 4).map(escapeHtml))}
      <h2>কেন Deshi Course-এর এই offer আলাদা</h2>
      ${renderList([
        `${escapeHtml(course.category)} বিষয়ে structured Bangla learning flow পাওয়া যাবে।`,
        `${escapeHtml(course.outcomeSummary)}`,
        `Private support, future update এবং certificate একসাথে থাকায় learningটা বেশি actionable হয়।`,
      ])}
      ${renderCta(`/courses/${course.slug}`, course.title, `${course.title} কোর্সের বিস্তারিত দেখুন`)}
    `,
  },
  {
    slugSuffix: 'portfolio-roadmap',
    title: (course: (typeof COURSE_DETAILS)[number]) =>
      `${course.title} শিখে কীভাবে skill, portfolio আর client-ready workflow বানাবেন`,
    excerpt: (course: (typeof COURSE_DETAILS)[number]) =>
      `${course.title} শিখে কীভাবে practice, output আর portfolio-ready execution flow তৈরি করবেন - তার roadmap।`,
    content: (course: (typeof COURSE_DETAILS)[number]) => `
      <h2>${escapeHtml(course.title)} শিখে real outcome কী হতে পারে</h2>
      <p>${escapeHtml(course.outcomeSummary)}</p>
      <h2>Workflow কীভাবে ধরবেন</h2>
      ${renderList(course.workflow.slice(0, 3).map(escapeHtml), true)}
      <h2>টুলস ও execution angle</h2>
      ${renderList(course.tools.slice(0, 4).map((tool) => `${escapeHtml(tool)} দিয়ে বাস্তব use-case practice করুন।`))}
      <h2>Portfolio-ready হতে কী করবেন</h2>
      ${renderList([
        `${escapeHtml(course.title)} related ১টি ছোট project শেষ করুন।`,
        `একই workflow নিজের use-case-এ adapt করে দ্বিতীয় sample তৈরি করুন।`,
        `Support group feedback নিয়ে output polish করে publishable proof-of-work বানান।`,
      ])}
      ${renderCta(`/courses/${course.slug}`, course.title, `${course.title} কোর্সে ভর্তি তথ্য দেখুন`)}
    `,
  },
  {
    slugSuffix: 'beginner-roadmap',
    title: (course: (typeof COURSE_DETAILS)[number]) =>
      `${course.title} কোর্স নেওয়ার আগে roadmap: beginner থেকে result পর্যন্ত`,
    excerpt: (course: (typeof COURSE_DETAILS)[number]) =>
      `Beginner learner হলে ${course.title} কীভাবে শুরু করবেন, কী শিখবেন, আর কোন result expect করতে পারেন - তার clear roadmap।`,
    content: (course: (typeof COURSE_DETAILS)[number]) => `
      <h2>Beginner হলে ${escapeHtml(course.title)} কীভাবে শুরু করবেন</h2>
      <p>${escapeHtml(course.description)}</p>
      <h2>প্রথম ৩ ধাপে কী focus করবেন</h2>
      ${renderList([
        `Core lesson flow বুঝে ${escapeHtml(course.category)}-এর base skill ধরুন।`,
        `ছোট practice output বানিয়ে feedback loop চালু করুন।`,
        `Real workflow বা client-facing use-case-এ apply করার আগে repeatable process বানান।`,
      ], true)}
      <h2>এই কোর্সে frequently asked জিনিস</h2>
      ${renderFaq(course.faq.slice(0, 3))}
      <h2>কেন এখন enrolment consider করবেন</h2>
      ${renderList([
        `Lifetime access থাকায় নিজের pace-এ শিখতে পারবেন।`,
        `Future update free থাকায় skill outdated হওয়ার risk কমে।`,
        `Support + certificate combo learning commitment বাড়ায়।`,
      ])}
      ${renderCta(`/courses/${course.slug}`, course.title, `${course.title} কোর্সের full roadmap দেখুন`)}
    `,
  },
];

const bundlePostVariants = [
  {
    slugSuffix: 'best-choice',
    title: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) =>
      `${bundle.title} bundle কাদের জন্য best choice`,
    excerpt: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) =>
      `${bundle.title} bundle কারা নিলে দ্রুত value পাবে, আর কেন একসাথে course + resource নেওয়া smarter option - তার overview।`,
    content: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) => `
      <h2>${escapeHtml(bundle.title)} bundle কেন consider করবেন</h2>
      <p>${escapeHtml(bundle.overview)}</p>
      <h2>এই bundle-এ যা থাকছে</h2>
      ${renderList(bundle.deliverables.slice(0, 6).map(escapeHtml))}
      <h2>কাদের জন্য bundle-টি সবচেয়ে useful</h2>
      ${renderList(bundle.audience.slice(0, 4).map(escapeHtml))}
      <h2>Included course combo থেকে কী advantage পাবেন</h2>
      ${renderList(bundle.includedCourses.map((course) => `${escapeHtml(course.title)} দিয়ে core skill শিখে সাথে সাথে bundled resource apply করতে পারবেন।`))}
      ${renderCta(`/bundles/${bundle.slug}`, bundle.title, `${bundle.title} bundle-এর বিস্তারিত দেখুন`)}
    `,
  },
  {
    slugSuffix: 'value-breakdown',
    title: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) =>
      `${bundle.title} নিলে course + resource combo-তে কী value পাবেন`,
    excerpt: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) =>
      `${bundle.title} bundle-এর ভিতরে course access, extra resource আর support মিলিয়ে কী value তৈরি হয় - তার breakdown।`,
    content: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) => `
      <h2>${escapeHtml(bundle.title)} bundle-এর value breakdown</h2>
      ${renderList([
        `${escapeHtml(bundle.highlight)} হওয়ায় শেখা আর execution-এর gap কমে যায়।`,
        `Lifetime access থাকায় repeated use-case-এ বারবার resource reuse করা যায়।`,
        `Private support group থাকায় stuck point clear করে দ্রুত move করা যায়।`,
      ])}
      <h2>Learning থেকে execution flow</h2>
      ${renderList(bundle.workflow.slice(0, 3).map(escapeHtml), true)}
      <h2>কেন একসাথে bundle নেওয়া practical</h2>
      ${renderList([
        `আলাদা আলাদা resource খোঁজার সময় বাঁচে।`,
        `Same skill-stack-এর course এবং extra asset একসাথে পাওয়া যায়।`,
        `Single decision-এ faster launch বা delivery flow তৈরি করা যায়।`,
      ])}
      ${renderCta(`/bundles/${bundle.slug}`, bundle.title, `${bundle.title} bundle-এর offer দেখুন`)}
    `,
  },
  {
    slugSuffix: 'execution-plan',
    title: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) =>
      `${bundle.title} দিয়ে faster execution plan: কোন order-এ শিখবেন ও use করবেন`,
    excerpt: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) =>
      `${bundle.title} bundle কিনলে কোন sequence-এ course, template বা library use করলে fastest result পাবেন - তার execution plan।`,
    content: (bundle: NonNullable<ReturnType<typeof getBundleDetailBySlug>>) => `
      <h2>${escapeHtml(bundle.title)} ব্যবহার করার recommended order</h2>
      ${renderList(bundle.workflow.slice(0, 3).map(escapeHtml), true)}
      <h2>Bundle user-এর জন্য quick wins</h2>
      ${renderList(bundle.deliverables.slice(0, 5).map((item) => `${escapeHtml(item)} - early stage-এই usable advantage দেয়।`))}
      <h2>কে fastest result পাবে</h2>
      ${renderList(bundle.audience.slice(0, 3).map(escapeHtml))}
      <h2>শেষ কথা</h2>
      <p>${escapeHtml(bundle.support)}</p>
      ${renderCta(`/bundles/${bundle.slug}`, bundle.title, `${bundle.title} bundle নিয়ে শুরু করুন`)}
    `,
  },
];

const productPostVariants = [
  {
    slugSuffix: 'ki-ebong-use-case',
    title: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) =>
      `${product.title} কী এবং কীভাবে ব্যবহার করলে দ্রুত value পাবেন`,
    excerpt: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) =>
      `${product.title} resource কী, কীভাবে ব্যবহার করতে হয়, আর কোন use-case-এ সবচেয়ে দ্রুত value দেয় - তার guide।`,
    content: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) => `
      <h2>${escapeHtml(product.title)} কী</h2>
      <p>${escapeHtml(product.overview)}</p>
      <h2>এই product-এ কী কী পাবেন</h2>
      ${renderList(product.deliverables.slice(0, 5).map(escapeHtml))}
      <h2>সবচেয়ে common use-case</h2>
      ${renderList(product.useCases.slice(0, 4).map(escapeHtml))}
      <h2>কীভাবে দ্রুত start করবেন</h2>
      ${renderList(product.workflow.slice(0, 3).map(escapeHtml), true)}
      ${renderCta(`/templates/${product.slug}`, product.title, `${product.title} প্রোডাক্টের বিস্তারিত দেখুন`)}
    `,
  },
  {
    slugSuffix: 'kader-jonno',
    title: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) =>
      `${product.title} কাদের জন্য useful resource এবং কেন`,
    excerpt: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) =>
      `${product.title} কারা use করলে সবচেয়ে বেশি লাভবান হবে, আর কেন এটি ready resource হিসেবে valuable - তার clear breakdown।`,
    content: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) => `
      <h2>${escapeHtml(product.title)} কাদের জন্য</h2>
      ${renderList(product.audience.slice(0, 4).map(escapeHtml))}
      <h2>কেন ready resource হিসেবে এটি useful</h2>
      ${renderList([
        `নিজে scratch থেকে বানানোর সময় কমে যায়।`,
        `Repeat use-case-এ same asset বা workflow reuse করা যায়।`,
        `Faster delivery বা publish cycle maintain করা সহজ হয়।`,
      ])}
      <h2>Practical use angle</h2>
      ${renderList(product.useCases.slice(0, 4).map(escapeHtml))}
      <h2>Support angle</h2>
      <p>${escapeHtml(product.support)}</p>
      ${renderCta(`/templates/${product.slug}`, product.title, `${product.title} resource access দেখুন`)}
    `,
  },
  {
    slugSuffix: 'workflow-benefit',
    title: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) =>
      `${product.title} কিনলে workflow, delivery আর reuse-এ কী সুবিধা পাবেন`,
    excerpt: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) =>
      `${product.title} কিনলে আপনার workflow, client delivery বা content execution-এ কোন practical সুবিধাগুলো পাবেন - তার roadmap।`,
    content: (product: NonNullable<ReturnType<typeof getProductDetailBySlug>>) => `
      <h2>${escapeHtml(product.title)} workflow-এ কীভাবে fit করবে</h2>
      ${renderList(product.workflow.slice(0, 3).map(escapeHtml), true)}
      <h2>এই resource থেকে immediate সুবিধা</h2>
      ${renderList(product.deliverables.slice(0, 4).map((item) => `${escapeHtml(item)} execution speed বাড়াতে সাহায্য করে।`))}
      <h2>দীর্ঘমেয়াদে benefit কোথায়</h2>
      ${renderList([
        `একই asset বা pattern multiple project-এ reuse করা যায়।`,
        `নিজের offer বা delivery system standardize করা সহজ হয়।`,
        `Instant access থাকায় learning থেকে action-এ delay কমে।`,
      ])}
      <h2>Frequently asked questions</h2>
      ${renderFaq(product.faq.slice(0, 3))}
      ${renderCta(`/templates/${product.slug}`, product.title, `${product.title} এখনই দেখুন`)}
    `,
  },
];

let promoDateOffset = 0;

const generatedCoursePosts: GeneratedBlogPost[] = COURSE_DETAILS.flatMap((course) =>
  coursePostVariants.map((variant) => ({
    slug: `${course.slug}-${variant.slugSuffix}`,
    title: variant.title(course),
    excerpt: variant.excerpt(course),
    content: variant.content(course),
    author: AUTHOR_NAME,
    date: formatBanglaDate(promoDateOffset++),
    image: course.image,
    category: 'কোর্স গাইড',
    tags: uniqueTags([course.title, course.category, 'Deshi Course', 'Bangla Course']),
  })),
);

const generatedBundlePosts: GeneratedBlogPost[] = BUNDLE_CATALOG.flatMap((bundle) => {
  const detail = getBundleDetailBySlug(bundle.slug);

  if (!detail) {
    return [];
  }

  return bundlePostVariants.map((variant) => ({
    slug: `${detail.slug}-${variant.slugSuffix}`,
    title: variant.title(detail),
    excerpt: variant.excerpt(detail),
    content: variant.content(detail),
    author: AUTHOR_NAME,
    date: formatBanglaDate(promoDateOffset++),
    image: detail.image,
    category: 'বান্ডেল গাইড',
    tags: uniqueTags([detail.title, 'Bundle Offer', 'Deshi Course', detail.highlight]),
  }));
});

const generatedProductPosts: GeneratedBlogPost[] = getAllProductDetailSlugs().flatMap((slug) => {
  const detail = getProductDetailBySlug(slug);

  if (!detail) {
    return [];
  }

  return productPostVariants.map((variant) => ({
    slug: `${detail.slug}-${variant.slugSuffix}`,
    title: variant.title(detail),
    excerpt: variant.excerpt(detail),
    content: variant.content(detail),
    author: AUTHOR_NAME,
    date: formatBanglaDate(promoDateOffset++),
    image: detail.image,
    category: 'প্রোডাক্ট গাইড',
    tags: uniqueTags([detail.title, detail.type, 'Deshi Course', 'Digital Product']),
  }));
});

export const PROMOTIONAL_BLOG_POSTS: GeneratedBlogPost[] = [
  ...generatedCoursePosts,
  ...generatedBundlePosts,
  ...generatedProductPosts,
];
