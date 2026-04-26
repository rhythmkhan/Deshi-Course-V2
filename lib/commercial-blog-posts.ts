import type { BlogPost } from '@/lib/blog-data';
import { BUNDLE_CATALOG } from '@/lib/bundle-catalog';
import { COURSE_CATALOG } from '@/lib/course-catalog';
import { bundlePath, coursePath, templatePath } from '@/lib/seo-catalog';
import { SHOP_CATALOG } from '@/lib/shop-catalog';

type Kind = 'course' | 'bundle' | 'product' | 'page';

type Seed = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  kind: Kind;
  href: string;
  relatedHref: string;
  relatedLabel: string;
  audience: string;
  hook: string;
};

function article(
  kind: Kind,
  slug: string,
  title: string,
  excerpt: string,
  href: string,
  relatedHref: string,
  relatedLabel: string,
  audience: string,
  hook: string,
) {
  const intro =
    kind === 'course'
      ? `যারা ${hook} শিখতে চান, তাদের জন্য ${title} একটি practical starting point.`
      : kind === 'bundle'
        ? `${title} bundle value বোঝার জন্য শেখা, asset access এবং deployment context একসাথে দেখা দরকার।`
        : kind === 'product'
          ? `${title} এমন একটি resource, যা faster execution, repeatable workflow বা ready asset value দেয়।`
          : `${title} page visitors-কে relevant next step খুঁজতে সাহায্য করে।`;

  const base = [
    `<p><strong>${intro}</strong></p>`,
    `<h2>প্রথমে কী জানা দরকার</h2><p>${excerpt} এখানে practical use case, buyer fit এবং workflow context explain করা হয়েছে।</p>`,
    `<h2>কাদের জন্য এটি useful</h2><p>${audience} - এই audience-এর জন্য relevant.</p>`,
    `<h2>কেন এটি relevant</h2><p>${kind === 'course' ? 'Structured learning path থাকলে theory থেকে output-এ যাওয়া সহজ হয়।' : kind === 'bundle' ? 'One place-এ more than one value item থাকলে decision friction কমে।' : kind === 'product' ? 'Ready resource থাকলে idea থেকে execution-এ যাওয়া দ্রুত হয়।' : 'Discovery hub হিসেবে pageটি navigation and internal linking improve করে।'}</p>`,
    `<h2>Natural next step</h2><p>Explore করুন <a href="${href}">${title} details</a>. Related option হিসেবে <a href="${relatedHref}">${relatedLabel}</a> useful হতে পারে।</p>`,
    `<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি beginner-friendly?</h3><p>${kind === 'page' ? 'এটি discovery-related content, তাই সবাই use করতে পারে।' : 'হ্যাঁ, যদি আপনি practical intent নিয়ে শুরু করেন।'}</p><h3>কী outcome expect করা যায়?</h3><p>${kind === 'course' ? 'A clearer learning path and practical skill foundation.' : kind === 'bundle' ? 'Faster learning plus more convenient asset access.' : kind === 'product' ? 'Faster setup and repeated use-case value.' : 'Clearer navigation and topic understanding.'}</p><h3>আর কী পড়া যায়?</h3><p><a href="${relatedHref}">${relatedLabel}</a> page-এ related context পাওয়া যাবে।</p>`,
  ].join('');

  if (slug === 'guide-n8n-automation-mastery') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>n8n automation কেন আগে শিখবেন</h2><p>Manual repetitive কাজ automate করতে, lead routing আর internal ops streamline করতে n8n one of the most practical starting tools।</p>',
      '<h2>কী ধরনের workflow দিয়ে শুরু করবেন</h2><p>Lead capture, CRM sync, email routing, reporting এবং approval flow - এই use case-গুলোতে দ্রুত output দেখা যায়।</p>',
      '<h2>শেখার roadmap কীভাবে সাজাবেন</h2><p>Basics, nodes, triggers, actions, error handling আর testing loop ধাপে ধাপে শিখলে practical confidence তৈরি হয়।</p>',
      '<h2>কারা সবচেয়ে benefit পায়</h2><p>Automation learners, founders, operators এবং freelancers যারা deployment-ready skill চান তাদের জন্য এটি relevant।</p>',
      '<h2>প্রধান next step</h2><p>Full details দেখতে <a href="/courses/n8n-automation-mastery">n8n automation mastery course details</a> দেখুন। Related bundle হিসেবে <a href="/bundles/n8n-course-plus-templates">n8n course plus templates</a> value-add দিতে পারে।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি beginner-friendly?</h3><p>হ্যাঁ, structured learning path থাকলে beginner-রা progress করতে পারে।</p><h3>শেখার পর কী output expect করা যায়?</h3><p>Real workflow এবং deployable automation output।</p><h3>আর কোন related page useful?</h3><p><a href="/bundles/n8n-course-plus-templates">n8n templates bundle</a> useful হতে পারে।</p>',
    ].join('');
  }

  if (slug === 'guide-vibe-coding-mastery') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Vibe coding মানে কী</h2><p>AI tool ব্যবহার করে faster prototype, landing page, tool বা MVP build করার workflow।</p>',
      '<h2>কোন ধরনের builder-এর জন্য useful</h2><p>Freelancer, founder, creator বা junior developer যারা দ্রুত ship করতে চান, তারা direct value পান।</p>',
      '<h2>কীভাবে practice করবেন</h2><p>Idea to prompt to draft to review to polish - এই ছোট loop repeat করলে learning curve দ্রুত কমে।</p>',
      '<h2>কেন prompt library গুরুত্বপূর্ণ</h2><p>Prompt library blank-page friction কমায় এবং cleaner iteration support করে।</p>',
      '<h2>প্রধান next step</h2><p>Full details দেখতে <a href="/courses/vibe-coding-mastery">vibe coding mastery details</a> দেখুন। Related bundle হিসেবে <a href="/bundles/vibe-coding-prompt-library">vibe coding prompt library bundle</a> helpful হতে পারে।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি coding background ছাড়া করা যায়?</h3><p>Basic familiarity থাকলে আরও ভালো, তবে structured course হলে non-expert-রাও progress করতে পারে।</p><h3>কী output আশা করা যায়?</h3><p>Landing page, app shell, tool prototype বা simple MVP।</p><h3>আর কী resource useful?</h3><p><a href="/bundles/vibe-coding-prompt-library">Prompt library bundle</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-ai-career-duo-bundle') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>দুইটা skill একসাথে কেন consider করবেন</h2><p>Automation + AI building combine করলে client work, product work আর internal system - তিন জায়গায় leverage পাওয়া যায়।</p>',
      '<h2>কাদের জন্য strong fit</h2><p>Career switcher, freelancer, creator বা founder যারা broad AI capability চান।</p>',
      '<h2>কীভাবে compare করবেন</h2><p>যদি workflow automation আর fast build দুটোই প্রয়োজন হয়, এই bundle logical choice হতে পারে।</p>',
      '<h2>bundle value breakdown</h2><p>দুটি flagship track together থাকায় learning path coherent হয় এবং switching cost কমে।</p>',
      '<h2>প্রধান next step</h2><p><a href="/bundles/ai-career-duo-bundle">AI Career Duo Bundle details</a> দেখুন। Related courses: <a href="/courses/n8n-automation-mastery">n8n</a> এবং <a href="/courses/vibe-coding-mastery">Vibe Coding</a>.</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এখানে কয়টি course আছে?</h3><p>দুটি flagship course bundled করা হয়েছে।</p><h3>This is for beginners?</h3><p>Yes, if they want a structured dual-track path.</p><h3>Related pages?</h3><p><a href="/courses/n8n-automation-mastery">n8n course</a> এবং <a href="/courses/vibe-coding-mastery">Vibe Coding course</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-creator-launch-bundle') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>কী included থাকে</h2><p>Build skill, prompt library, automation skill আর ready template assets একত্রে পাওয়া যায়।</p>',
      '<h2>কারা benefit পাবে</h2><p>Creators and freelancers যারা end-to-end launch stack চান।</p>',
      '<h2>Why it matters</h2><p>একাধিক আলাদা resource-এর বদলে এক coherent system থাকলে execution সহজ হয়।</p>',
      '<h2>stack breakdown</h2><p>Vibe coding, automation, prompting এবং ready templates combine হলে launch-ready output দ্রুত হয়।</p>',
      '<h2>প্রধান next step</h2><p><a href="/bundles/creator-launch-bundle">Creator Launch Bundle full details</a> দেখুন। Related pages: <a href="/courses/vibe-coding-mastery">Vibe Coding</a> এবং <a href="/products/n8n-20k-templates">n8n templates</a>.</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি complete stack?</h3><p>হ্যাঁ, curated multi-asset bundle।</p><h3>Who should buy?</h3><p>Launch-ready creators and freelancers।</p><h3>Related pages?</h3><p><a href="/courses/vibe-coding-mastery">Vibe Coding Mastery</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-n8n-20k-templates') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>resource কীভাবে use করবেন</h2><p>Template adapt করে নিজের use-case-এ বসালে repeatable workflow দ্রুত দাঁড়ায়।</p>',
      '<h2>automation start fast কেন হয়</h2><p>Ready template থাকলে trigger/action structure বুঝতে less blank-page time লাগে।</p>',
      '<h2>কাদের জন্য useful</h2><p>Automation builders, operators এবং দ্রুত start চাওয়া teams-এর জন্য relevant।</p>',
      '<h2>practical use cases</h2><p>Lead gen, CRM, e-commerce, marketing বা internal ops-এর জন্য faster setup possible।</p>',
      '<h2>প্রধান next step</h2><p><a href="/products/n8n-20k-templates">n8n 20K+ Templates details</a> দেখুন এবং course version-এর জন্য <a href="/courses/n8n-automation-mastery">n8n automation mastery</a> explore করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি course replace করে?</h3><p>না, এটা deployment asset; course শেখাকে accelerate করে।</p><h3>কার জন্য best?</h3><p>Automation builders যারা faster starts চান।</p><h3>আর কী useful?</h3><p><a href="/bundles/n8n-course-plus-templates">n8n course plus templates bundle</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-prompt-ui-library') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>কীভাবে use করবেন</h2><p>Prompt reference আর UI block copy করে দ্রুত landing, tool বা dashboard draft করতে পারেন।</p>',
      '<h2>blank page কেন problem</h2><p>Prompt blocks আর UI patterns থাকলে idea থেকে structure-এ যাওয়া দ্রুত হয়।</p>',
      '<h2>কার জন্য useful</h2><p>Vibe coders, product builders এবং solo creators-এর জন্য relevant।</p>',
      '<h2>why this matters</h2><p>Fast iteration আর clearer structure output quality improve করে।</p>',
      '<h2>প্রধান next step</h2><p><a href="/products/prompt-ui-library">Prompt + UI Library details</a> দেখুন এবং <a href="/courses/vibe-coding-mastery">Vibe coding course</a> consider করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি course-এর বদলি?</h3><p>না, এটি support resource।</p><h3>কার জন্য best?</h3><p>UI builders, creators and developers।</p><h3>আর কী explore করতে পারি?</h3><p><a href="/bundles/vibe-coding-prompt-library">Vibe coding prompt bundle</a> দেখুন।</p>',
    ].join('');
  }

  if (slug === 'guide-lovable') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Lovable credit package কেন consider করবেন</h2><p>Long-term builder workflow-এ credit planning, usage window এবং fast iteration value important।</p>',
      '<h2>কাদের জন্য useful</h2><p>Heavy builders, agency users এবং frequent prototype makers-এর জন্য relevant।</p>',
      '<h2>কীভাবে compare করবেন</h2><p>আপনার daily usage, expected build count এবং planning horizon দেখে package fit বিচার করুন।</p>',
      '<h2>কেন এটি relevant</h2><p>Steady access থাকলে experimentation friction কমে এবং release cadence smooth হয়।</p>',
      '<h2>Natural next step</h2><p><a href="/products/lovable">Lovable Pro credit package details</a> দেখুন এবং smaller pack হিসেবে <a href="/products/lovable-400-credit">Lovable 400 Credit</a> compare করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি one-time package?</h3><p>Visible offer অনুযায়ী one-time access style package।</p><h3>কার জন্য better?</h3><p>Long-term builders and heavy users।</p><h3>Related page?</h3><p><a href="/products/lovable-400-credit">smaller credit package</a> useful হতে পারে।</p>',
    ].join('');
  }

  if (slug === 'guide-lovable-400-credit') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Smaller credit pack কেন practical হতে পারে</h2><p>Low-to-mid budget buyers-এর জন্য smaller credit pack often more practical and risk-light।</p>',
      '<h2>এটি কার জন্য</h2><p>Budget conscious buyers, starter builders এবং test-driven users-এর জন্য fit।</p>',
      '<h2>কেন compare করা দরকার</h2><p>Use frequency, duration আর budget align করলে better decision হয়।</p>',
      '<h2>What to expect</h2><p>Entry workflow test করার জন্য manageable credit size এবং simple purchase decision path।</p>',
      '<h2>প্রধান next step</h2><p><a href="/products/lovable-400-credit">Lovable 400 Credit details</a> দেখুন এবং <a href="/products/lovable-pro-200-credit">Lovable 200 Credit</a> সাথে compare করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি starter-friendly?</h3><p>হ্যাঁ, smaller package হওয়ায় starter buyer-দের জন্য fit।</p><h3>কেন 400 credit?</h3><p>Entry workflow test করার জন্য practical size।</p><h3>Related page?</h3><p><a href="/products/lovable">Lovable Pro package</a> compare করতে পারেন।</p>',
    ].join('');
  }

  if (slug === 'guide-lovable-pro-200-credit') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Entry-level package দিয়ে কীভাবে test করবেন</h2><p>Small budget-এ platform fit যাচাই করা যায়, তাই first-time buyers-এর জন্য risk কমে।</p>',
      '<h2>কাদের জন্য relevant</h2><p>First-time Lovable users and small-budget testers-এর জন্য।</p>',
      '<h2>কেন এটি useful</h2><p>Credit-based workflow try করে দ্রুত বুঝতে পারবেন আপনার use-case fit কিনা।</p>',
      '<h2>কীভাবে decide করবেন</h2><p>Usage যদি limited হয়, smaller pack practical; বেশি হলে higher tier compare করুন।</p>',
      '<h2>Natural next step</h2><p><a href="/products/lovable-pro-200-credit">Lovable Pro 200 Credit details</a> দেখুন এবং <a href="/products/lovable">Lovable Pro package</a> compare করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি beginner pack?</h3><p>হ্যাঁ, entry-style offer।</p><h3>কেন start here?</h3><p>Low risk test drive-এর জন্য।</p><h3>Related page?</h3><p><a href="/products/lovable">Lovable Pro package</a> useful হতে পারে।</p>',
    ].join('');
  }

  if (slug === 'guide-1m-plus-tshirt-design-package') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>T-shirt design package কীভাবে কাজে লাগবে</h2><p>Design sellers and merch creators-এর জন্য ready asset pack দ্রুত output দেয়।</p>',
      '<h2>কীভাবে use করবেন</h2><p>Pack asset নিয়ে mockup, listing বা print workflow-এ বসাতে পারেন।</p>',
      '<h2>কার জন্য useful</h2><p>Design sellers, merch creators and content teams-এর জন্য relevant।</p>',
      '<h2>কেন এটি relevant</h2><p>Asset availability থাকলে design iteration quick হয় এবং time-to-list কমে।</p>',
      '<h2>Natural next step</h2><p><a href="/products/1m-plus-tshirt-design-package">T-shirt design package details</a> দেখুন এবং <a href="/products">template archive</a> explore করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি merch sellers-এর জন্য?</h3><p>হ্যাঁ, especially যারা ready design resource চান।</p><h3>Can it help workflow?</h3><p>Yes, repeatable design output faster হয়।</p><h3>Related page?</h3><p><a href="/products">template archive</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-monkey-vlog-viral-video') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Viral video resource pack কীভাবে কাজে লাগে</h2><p>Short-form creators-এর জন্য idea direction often সবচেয়ে বড় bottleneck।</p>',
      '<h2>কীভাবে use করবেন</h2><p>Idea reference, pacing hint এবং reuse-friendly direction হিসেবে কাজে লাগান।</p>',
      '<h2>কার জন্য useful</h2><p>Short-form video creators and editors-এর জন্য relevant।</p>',
      '<h2>কেন এটি relevant</h2><p>Faster ideation মানে quicker publishing cadence এবং more consistent output।</p>',
      '<h2>Natural next step</h2><p><a href="/products/monkey-vlog-viral-video">viral video resource details</a> দেখুন। Related course: <a href="/courses/phone-ai-video-editing">Phone video editing</a>.</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি editing tool?</h3><p>না, এটি idea/resource direction।</p><h3>কার জন্য best?</h3><p>Reels and shorts creators।</p><h3>Related page?</h3><p><a href="/courses/phone-ai-video-editing">Phone video editing course</a> helpful।</p>',
    ].join('');
  }

  if (slug === 'guide-600-plus-wordpress-premium-website-templates') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>WordPress template collection কেন useful</h2><p>Website launch দ্রুত করতে ready template collection often সবচেয়ে direct shortcut।</p>',
      '<h2>কীভাবে use করবেন</h2><p>Template select করে branding, copy আর content adjust করুন।</p>',
      '<h2>কার জন্য useful</h2><p>Site owners, freelancers and agencies-এর জন্য relevant।</p>',
      '<h2>কেন এটি relevant</h2><p>Ready structure থাকলে launch friction কমে এবং delivery timeline short হয়।</p>',
      '<h2>Natural next step</h2><p><a href="/products/600-plus-wordpress-premium-website-templates">WordPress template collection details</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি agencies-এর জন্য?</h3><p>হ্যাঁ, especially launch-driven teams।</p><h3>Can it speed up delivery?</h3><p>Yes, template-first workflow faster।</p><h3>Related page?</h3><p><a href="/products/wordpress-premium-themes-and-plugins-3000-plus">themes and plugins library</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-wordpress-premium-themes-and-plugins-3000-plus') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>WordPress themes and plugins library কেন relevant</h2><p>Different use-case handle করার জন্য flexibility পাওয়া যায়।</p>',
      '<h2>কার জন্য useful</h2><p>WordPress operators, agencies and freelancers-এর জন্য।</p>',
      '<h2>কীভাবে compare করবেন</h2><p>Use-case, compatibility এবং launch requirement match করা উচিত।</p>',
      '<h2>কেন এটি relevant</h2><p>Large library থাকলে multiple project type-এ reuse possible হয়।</p>',
      '<h2>Natural next step</h2><p><a href="/products/wordpress-premium-themes-and-plugins-3000-plus">themes and plugins details</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি agencies use করতে পারবে?</h3><p>হ্যাঁ, delivery and reuse-এর জন্য relevant।</p><h3>What matters most?</h3><p>Compatibility and use-case alignment.</p><h3>Related page?</h3><p><a href="/products/600-plus-wordpress-premium-website-templates">website templates collection</a> দেখুন।</p>',
    ].join('');
  }

  if (slug === 'guide-bm-verify-certificate') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>BM Verify Certificate resource কীভাবে use করবেন</h2><p>Advertisers and verification seekers-এর জন্য compliance-first resource useful হতে পারে।</p>',
      '<h2>কাদের জন্য useful</h2><p>Advertisers, founders and media buyers-এর জন্য relevant।</p>',
      '<h2>কেন এটি relevant</h2><p>Compliance and account readiness business continuity-তে important।</p>',
      '<h2>কীভাবে approach করবেন</h2><p>Verification workflow, documentation আর support path remember করুন এবং legitimate use নিশ্চিত করুন।</p>',
      '<h2>Natural next step</h2><p><a href="/products/bm-verify-certificate">BM Verify Certificate details</a> দেখুন এবং <a href="/courses/business-manager-verify">course</a> explore করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি compliant resource?</h3><p>Content should be used for legitimate verification workflow only.</p><h3>কারা use করবে?</h3><p>Ads and compliance stakeholders।</p><h3>Related page?</h3><p><a href="/courses/business-manager-verify">Business Manager verify course</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-ai-horror-reels-bundle-drive') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>AI horror reels bundle কীভাবে কাজে লাগে</h2><p>Reels creators and editors-এর জন্য niche-specific content bundle time save করতে পারে।</p>',
      '<h2>কীভাবে use করবেন</h2><p>Idea direction এবং reusable asset reference হিসেবে use করতে পারেন।</p>',
      '<h2>কার জন্য useful</h2><p>Short-form creators and editors-এর জন্য relevant।</p>',
      '<h2>কেন এটি relevant</h2><p>Clear niche asset থাকলে faster publishing possible এবং content angle consistent থাকে।</p>',
      '<h2>Natural next step</h2><p><a href="/products/ai-horror-reels-bundle-drive">AI horror reels bundle details</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি editing package?</h3><p>এটি resource and idea direction package।</p><h3>কার জন্য best?</h3><p>Reels and short-form teams।</p><h3>Related page?</h3><p><a href="/courses/phone-ai-video-editing">phone video editing course</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-1000-plus-anime-reels-bundle-drive') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Anime reels bundle কীভাবে creator workflow দ্রুত করে</h2><p>Anime-style reels creators-এর জন্য curated bundle content repetition help করতে পারে।</p>',
      '<h2>কীভাবে use করবেন</h2><p>Idea, reference এবং reuse-friendly direction হিসেবে কাজে লাগান।</p>',
      '<h2>কার জন্য useful</h2><p>Reels creators and editors-এর জন্য relevant।</p>',
      '<h2>কেন এটি relevant</h2><p>Consistent niche content তৈরি করা easier হয় এবং planning দ্রুত হয়।</p>',
      '<h2>Natural next step</h2><p><a href="/products/1000-plus-anime-reels-bundle-drive">anime reels bundle details</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এটি কি creator-friendly?</h3><p>হ্যাঁ, niche creators-এর জন্য।</p><h3>কার জন্য best?</h3><p>Short-form editors and anime content creators।</p><h3>Related page?</h3><p><a href="/products/ai-horror-reels-bundle-drive">AI horror reels bundle</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-home') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Homepage-এ কী দেখবেন</h2><p>Featured courses, bundles, products and support links - এই চারটা entry point content discovery সহজ করে।</p>',
      '<h2>কেন homepage important</h2><p>New visitors-এর জন্য page structure, brand promise আর next action clear হওয়া দরকার।</p>',
      '<h2>কীভাবে browse করবেন</h2><p>প্রথমে headline offers দেখুন, তারপর course, bundle বা template archive-এ গিয়ে compare করুন।</p>',
      '<h2>কারা benefit পায়</h2><p>Platform overview বুঝতে চাওয়া new visitors এবং research-minded buyers।</p>',
      '<h2>Natural next step</h2><p><a href="/">Homepage</a> থেকে শুরু করুন, তারপর <a href="/courses">course archive</a> এবং <a href="/products">template archive</a> explore করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>Homepage-এ কী খুঁজব?</h3><p>Featured courses, bundles, products and support links।</p><h3>পরের step কী?</h3><p>Course archive বা templates archive।</p><h3>আর কী useful?</h3><p><a href="/about">About page</a> trust build করে।</p>',
    ].join('');
  }

  if (slug === 'guide-courses') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Course archive compare করার সময় কী দেখবেন</h2><p>Topic, difficulty, price, support and expected output fit মিলিয়ে দেখতে হবে।</p>',
      '<h2>কেন compare-based browsing useful</h2><p>একাধিক course-এর মধ্যে goal mismatch থাকলে buyer confidence কমে; structured comparison friction কমায়।</p>',
      '<h2>কোন learning path choose করবেন</h2><p>Automation, vibe coding, video editing বা app development - your goal অনুযায়ী track select করুন।</p>',
      '<h2>কারা benefit পায়</h2><p>Comparison shoppers এবং returning visitors যারা next best course খুঁজছেন।</p>',
      '<h2>Natural next step</h2><p><a href="/courses">Course archive</a> explore করুন এবং <a href="/blog">blog archive</a> থেকে practical guide পড়ুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>কী বিষয় দেখে choose করব?</h3><p>Learning goal and output type।</p><h3>Related page?</h3><p><a href="/categories">category hub</a> useful।</p><h3>Next step?</h3><p><a href="/blog">blog archive</a> থেকে practical guide পড়ুন।</p>',
    ].join('');
  }

  if (slug === 'guide-bundles') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Bundle archive কেন value-based decision-এর জন্য useful</h2><p>Included items, price, access and workflow fit compare করলে actual value বোঝা সহজ হয়।</p>',
      '<h2>কাদের জন্য best</h2><p>Deal-seeking users and buyers যারা one-place comparison চান।</p>',
      '<h2>কীভাবে compare করবেন</h2><p>Course count, extra resources, support and repeat-use potential হিসাব করুন।</p>',
      '<h2>কেন এটি relevant</h2><p>Bundle format learning-to-asset gap কমায় এবং perceived value বাড়ায়।</p>',
      '<h2>Natural next step</h2><p><a href="/bundles">Bundle archive</a> দেখুন এবং <a href="/courses">course archive</a> compare করুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>Bundle কেন useful?</h3><p>একাধিক item একসাথে value দেয়।</p><h3>Which pages next?</h3><p><a href="/courses">Course archive</a> and <a href="/products">template archive</a>.</p><h3>আরও পড়ব কোথায়?</h3><p><a href="/blog">Blog archive</a> useful।</p>',
    ].join('');
  }

  if (slug === 'guide-templates') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Template archive থেকে কীভাবে select করবেন</h2><p>Format, use-case, price and output fit বিবেচনা করতে হবে।</p>',
      '<h2>কারা benefit পায়</h2><p>Digital product buyers, creators, marketers and builders।</p>',
      '<h2>কেন এটি relevant</h2><p>Ready template থাকলে faster execution এবং repeatable output পাওয়া যায়।</p>',
      '<h2>কোন resource path useful</h2><p>Automation assets, prompt libraries, WordPress packs এবং creator bundles compare করা যায়।</p>',
      '<h2>Natural next step</h2><p><a href="/products">Template archive</a> explore করুন এবং <a href="/courses/n8n-automation-mastery">n8n course</a> পড়ুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>কী দেখে select করব?</h3><p>Use-case and access type।</p><h3>Related page?</h3><p><a href="/courses/n8n-automation-mastery">n8n course</a> useful।</p><h3>Next step?</h3><p><a href="/blog">Blog archive</a> read করুন।</p>',
    ].join('');
  }

  if (slug === 'guide-categories') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Category hub কেন discovery improve করে</h2><p>Topic grouping browsing efficiency এবং search intent match improve করে।</p>',
      '<h2>কিভাবে use করবেন</h2><p>আপনার interest topic select করে corresponding courses or products compare করুন।</p>',
      '<h2>কারা benefit পায়</h2><p>Topic browsers, researchers এবং intent-driven visitors।</p>',
      '<h2>কেন এটি relevant</h2><p>Well-organized categories internal navigation এবং SEO context দুটোই improve করে।</p>',
      '<h2>Natural next step</h2><p><a href="/categories">Category hub</a> explore করুন এবং <a href="/courses">course archive</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>Category page কেন useful?</h3><p>It makes navigation clearer।</p><h3>Next step?</h3><p><a href="/courses">Courses</a> or <a href="/products">templates</a>.</p><h3>আরও context?</h3><p><a href="/blog">Blog archive</a> পড়ুন।</p>',
    ].join('');
  }

  if (slug === 'guide-blog') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Blog archive থেকে কী value পাওয়া যায়</h2><p>Commercial guides, support articles এবং topic-focused posts একই place-এ পাওয়া যায়।</p>',
      '<h2>কেন এটি useful</h2><p>Blog archive topical authority দেখায় এবং buyer education build করে।</p>',
      '<h2>কারা benefit পায়</h2><p>Researchers, buyers and evaluators যারা informed decision নিতে চান।</p>',
      '<h2>কেন এটি relevant</h2><p>Content depth brand trust বাড়ায় এবং internal linking strong করে।</p>',
      '<h2>Natural next step</h2><p><a href="/blog">Blog archive</a> explore করুন এবং <a href="/courses">course archive</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>এখানে কী ধরনের content আছে?</h3><p>Commercial guides and editorial posts।</p><h3>Next step?</h3><p><a href="/products">Templates</a> or <a href="/bundles">bundles</a>।</p><h3>আরও trust?</h3><p><a href="/about">About page</a> read করুন।</p>',
    ].join('');
  }

  if (slug === 'guide-about') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>About page কেন trust build করে</h2><p>Visitors platform identity, mission এবং offer context বুঝে।</p>',
      '<h2>কারা benefit পায়</h2><p>Trust seekers and cautious buyers যারা আগে brand context verify করেন।</p>',
      '<h2>কেন এটি relevant</h2><p>Clear mission buyer confidence improve করে এবং conversion friction কমায়।</p>',
      '<h2>What to look for</h2><p>Mission, support availability, content scope and platform positioning দেখুন।</p>',
      '<h2>Natural next step</h2><p><a href="/about">About page</a> read করুন এবং <a href="/contact">Contact page</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>About page কেন important?</h3><p>It establishes trust and identity।</p><h3>Next step?</h3><p><a href="/courses">Courses</a> explore করুন।</p><h3>আর কী useful?</h3><p><a href="/blog">Blog archive</a> read করুন।</p>',
    ].join('');
  }

  if (slug === 'guide-contact') {
    return [
      `<p><strong>${intro}</strong></p>`,
      '<h2>Contact page কেন useful</h2><p>Questions, purchase help and support escalation easier হয়।</p>',
      '<h2>কারা benefit পায়</h2><p>Support-seeking visitors and buyers যারা direct help চান।</p>',
      '<h2>কেন এটি relevant</h2><p>Clear support access friction কমায় এবং buyer confidence বাড়ায়।</p>',
      '<h2>কীভাবে use করবেন</h2><p>Purchase, access, or policy related প্রশ্ন হলে support path follow করুন।</p>',
      '<h2>Natural next step</h2><p><a href="/contact">Contact page</a> খুলুন এবং <a href="/faq">FAQ page</a> দেখুন।</p>',
      '<h2>সচরাচর জিজ্ঞাসা</h2><h3>Contact page কেন useful?</h3><p>It makes support accessible।</p><h3>Next step?</h3><p><a href="/signin">Sign in</a> or <a href="/courses">courses</a>.</p><h3>আরও helpful?</h3><p><a href="/blog">Blog archive</a> দেখুন।</p>',
    ].join('');
  }

  return base;
}

function makeSeed(kind: Kind, slug: string, title: string, excerpt: string, image: string, category: string, tags: string[], seoTitle: string, seoDescription: string, href: string, relatedHref: string, relatedLabel: string, audience: string, hook: string): Seed {
  return { kind, slug, title, excerpt, image, category, tags, seoTitle, seoDescription, href, relatedHref, relatedLabel, audience, hook };
}

const courseSeeds = COURSE_CATALOG.map((course) => {
  const related = BUNDLE_CATALOG.find((bundle) => bundle.includedCourseSlugs.includes(course.slug)) ?? BUNDLE_CATALOG[0];
  return makeSeed(
    'course',
    `guide-${course.slug}`,
    `${course.title} শেখার practical roadmap`,
    `${course.title} নিয়ে practical শুরু, use case, এবং search intent explain করা হয়েছে।`,
    course.image,
    'কোর্স গাইড',
    [course.title.split(' ')[0], 'Guide', 'Learning'],
    `${course.title} Roadmap | দেশি কোর্স`,
    `${course.title} শেখার practical roadmap এবং related next step জানুন।`,
    coursePath(course.slug),
    bundlePath(related.slug),
    related.title,
    'beginner to intermediate learners',
    course.title,
  );
});

const bundleSeeds = BUNDLE_CATALOG.map((bundle) => {
  const relatedCourseSlug = bundle.includedCourseSlugs[0] ?? COURSE_CATALOG[0].slug;
  return makeSeed(
    'bundle',
    `guide-${bundle.slug}`,
    `${bundle.title} bundle value guide`,
    `${bundle.title} কীভাবে শেখা আর assets একসাথে value দেয় তা explain করা হয়েছে।`,
    bundle.image,
    'বান্ডেল গাইড',
    [bundle.title.split(' ')[0], 'Bundle', 'Value'],
    `${bundle.title} Value Guide | দেশি কোর্স`,
    `${bundle.title} bundle কেন value দেয় তা practicalভাবে জানুন।`,
    bundlePath(bundle.slug),
    coursePath(relatedCourseSlug),
    COURSE_CATALOG.find((course) => course.slug === relatedCourseSlug)?.title ?? 'Related course',
    'deal-seeking learners and buyers',
    bundle.title,
  );
});

const productSeeds = SHOP_CATALOG.map((product) => {
  const related = COURSE_CATALOG.find((course) => product.description.toLowerCase().includes(course.slug.split('-')[0])) ?? COURSE_CATALOG[0];
  return makeSeed(
    'product',
    `guide-${product.slug}`,
    `${product.title} ব্যবহার করার practical guide`,
    `${product.title} কীভাবে use করবেন, কার জন্য useful, এবং কেন relevant তা explain করা হয়েছে।`,
    product.image,
    'প্রোডাক্ট গাইড',
    [product.type.split(' ')[0], 'Resource', 'Guide'],
    `${product.title} Guide | দেশি কোর্স`,
    `${product.title} use করার practical guide এবং related next step জানুন।`,
    templatePath(product.slug),
    coursePath(related.slug),
    related.title,
    'digital product buyers and creators',
    product.title,
  );
});

const pageSeeds = [
  makeSeed('page', 'guide-home', 'DeshiCourse homepage guide', 'Homepage থেকে কীভাবে start করবেন তা explain করা হয়েছে।', '/images/blog/editorial-01.webp', 'ল্যান্ডিং গাইড', ['Homepage', 'Guide', 'Overview'], 'DeshiCourse Homepage Guide | দেশি কোর্স', 'Homepage থেকে কীভাবে শুরু করবেন তা জানুন।', '/', '/courses', 'Courses archive', 'new visitors', 'platform overview'),
  makeSeed('page', 'guide-courses', 'Course archive selection guide', 'Course archive compare করে learning path বাছাই করার guide.', '/images/blog/editorial-02.webp', 'ল্যান্ডিং গাইড', ['Courses', 'Comparison', 'Guide'], 'Course Archive Guide | দেশি কোর্স', 'Course archive থেকে best learning path বাছাই করুন।', '/courses', '/blog', 'Blog archive', 'comparison shoppers', 'course browsing'),
  makeSeed('page', 'guide-bundles', 'Bundle archive value guide', 'Bundle archive থেকে value-based choice করার guide.', '/images/blog/editorial-03.webp', 'ল্যান্ডিং গাইড', ['Bundles', 'Value', 'Guide'], 'Bundle Archive Guide | দেশি কোর্স', 'Bundle archive দিয়ে better decision নিন।', '/bundles', '/courses', 'Course archive', 'deal-seeking users', 'bundle comparison'),
  makeSeed('page', 'guide-templates', 'Template archive selection guide', 'Template archive থেকে useful resource select করার guide.', '/images/blog/editorial-04.webp', 'ল্যান্ডিং গাইড', ['Templates', 'Resource', 'Guide'], 'Template Archive Guide | দেশি কোর্স', 'Template archive থেকে useful resource বাছাই করুন।', '/products', '/blog', 'Blog archive', 'digital product buyers', 'resource browsing'),
  makeSeed('page', 'guide-categories', 'Category hub discovery guide', 'Category hub কেন browsing easier করে তা explain করা হয়েছে।', '/images/blog/editorial-05.webp', 'ল্যান্ডিং গাইড', ['Categories', 'Discovery', 'SEO'], 'Category Hub Guide | দেশি কোর্স', 'Category hub কীভাবে discovery help করে তা জানুন।', '/categories', '/courses', 'Course archive', 'topic browsers', 'navigation'),
  makeSeed('page', 'guide-blog', 'Blog archive topical guide', 'Blog archive কীভাবে topical authority দেখায় তা explain করা হয়েছে।', '/images/blog/editorial-06.webp', 'ল্যান্ডিং গাইড', ['Blog', 'Authority', 'SEO'], 'Blog Archive Guide | দেশি কোর্স', 'Blog archive দিয়ে topical authority explore করুন।', '/blog', '/courses', 'Course archive', 'researchers and evaluators', 'editorial discovery'),
  makeSeed('page', 'guide-about', 'About page trust guide', 'About page কীভাবে trust build করে তা explain করা হয়েছে।', '/images/blog/editorial-07.webp', 'ল্যান্ডিং গাইড', ['About', 'Trust', 'Brand'], 'About DeshiCourse Guide | দেশি কোর্স', 'About page কেন trust build করে তা জানুন।', '/about', '/contact', 'Contact page', 'brand trust seekers', 'brand trust'),
  makeSeed('page', 'guide-contact', 'Contact page support guide', 'Contact page কীভাবে support path তৈরি করে তা explain করা হয়েছে।', '/images/blog/editorial-08.webp', 'ল্যান্ডিং গাইড', ['Contact', 'Support', 'Trust'], 'Contact DeshiCourse Guide | দেশি কোর্স', 'Contact page কীভাবে support path তৈরি করে তা জানুন।', '/contact', '/faq', 'FAQ page', 'support-seeking users', 'support access'),
];

const seeds = [...courseSeeds, ...bundleSeeds, ...productSeeds, ...pageSeeds];

export const COMMERCIAL_BLOG_POSTS: BlogPost[] = seeds.map((seed, index) => ({
  id: `commercial-${index + 1}`,
  slug: seed.slug,
  title: seed.title,
  excerpt: seed.excerpt,
  content: article(seed.kind, seed.slug, seed.title, seed.excerpt, seed.href, seed.relatedHref, seed.relatedLabel, seed.audience, seed.hook),
  author: 'দেশি কোর্স স্ট্র্যাটেজি ডেস্ক',
  date: `2${index % 8} এপ্রিল, ২০২৬`,
  image: seed.image,
  category: seed.category,
  tags: seed.tags,
  seoTitle: seed.seoTitle,
  seoDescription: seed.seoDescription,
}));

