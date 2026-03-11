import { PROMOTIONAL_BLOG_POSTS } from './blog-promotions';

export interface BlogPost {
  id: string;
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

interface TrendBlogSeed {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  imageSeed: string;
  category: string;
  tags: string[];
}

const renderList = (items: string[], ordered = false) => {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
};

const LEARNING_TIPS: Record<string, string> = {
  "এআই ট্রেন্ড": "workflow design, evaluation আর practical experimentation শিখুন।",
  "বাংলা এআই": "native Bengali UX, regional dataset আর localization flow তৈরি করুন।",
  "স্টার্টআপ": "narrow ICP, measurable ROI আর trust-first onboarding বোঝা দরকার।",
  "কোডিং এআই": "repo context, diff review, tests আর secure automation habit গড়ে তুলুন।",
  "ক্রিয়েটর ইকোনমি": "content system, thumbnail thinking আর distribution loop গড়ে তুলুন।",
  "প্রোডাক্টিভিটি এআই": "template design, approval gate আর human review habit রাখুন।",
  "ডেভেলপার টুলিং": "schema, logs, fallback আর production quality নিয়ে কাজ করুন।",
  "ওয়েব ট্রেন্ড": "semantic markup, agent-friendly UX আর visibility metric বুঝুন।",
  "মোবাইল এআই": "device constraint, latency আর privacy-safe UX শিখুন।",
  "এআই সেফটি": "verification, provenance আর disclosure workflow বোঝা জরুরি।",
  "এআই নীতি": "language support, infra access আর policy-aware product design নিয়ে ভাবুন।",
  "ভিডিও এআই": "storyboard, pacing, scene review আর post-edit polish শিখুন।",
  "ক্রিয়েটিভ এআই": "brand-safe prompting, asset review আর creative direction নিয়ে কাজ করুন।",
  "রিসার্চ এআই": "source filtering, citation আর structured note-taking অভ্যাস করুন।",
  "এন্টারপ্রাইজ এআই": "governance, role access আর measurable workflow outcome track করুন।",
  "রোবোটিক্স": "planning, feedback loop আর simulation thinking বোঝা দরকার।",
  "এডটেক এআই": "source-grounded study workflow আর academic integrity process তৈরি করুন।",
  "হার্ডওয়্যার": "deployment target, model sizing আর inference economics বোঝা শিখুন।",
  "এআই ইনফ্রা": "latency, throughput আর cost-per-task metric নিয়ে কাজ করুন।",
  "ক্যারিয়ার": "AI literacy, review skill আর domain expertise combo গড়ে তুলুন।",
  "সার্চ এআই": "evidence-rich content আর answer-engine friendly structure ব্যবহার করুন।",
  "প্রোডাক্ট ডিজাইন": "approval UX, recovery path আর clear metric framework নিয়ে ভাবুন।",
  "ওপেন মডেল": "open বনাম closed model tradeoff task অনুযায়ী compare করুন।",
  "কনজিউমার এআই": "habit loop, ambient interaction আর privacy-first design শিখুন।",
  "ইন্ডাস্ট্রিয়াল এআই": "simulation, environment modeling আর decision-support flow বোঝুন।"
};

const createTrendContent = (post: TrendBlogSeed) => `
  <h2>কেন বিষয়টি এখন ট্রেন্ডিং</h2>
  <p>${post.title} টাইপের trend দেখাচ্ছে যে ${post.category} এখন দ্রুত নতুন feature-এর বাইরে গিয়ে বাস্তব workflow, শেখা এবং product building-এর অংশ হয়ে যাচ্ছে।</p>
  <h2>এখন সবচেয়ে গুরুত্বপূর্ণ কী?</h2>
  ${renderList([
    `${post.tags[0]} এবং ${post.tags[1] ?? post.category} এখন market conversation-এর একদম কেন্দ্রের দিকে চলে এসেছে।`,
    'speed-এর পাশাপাশি trust, reliability এবং review layer এখন আগের চেয়ে অনেক বেশি গুরুত্বপূর্ণ।',
    'যে টিম ছোট scope-এ test করে, measure করে এবং iterate করে, তারা সবচেয়ে দ্রুত value তুলতে পারে।',
  ])}
  <h2>আপনার জন্য সুযোগ কোথায়</h2>
  ${renderList([
    LEARNING_TIPS[post.category] ?? 'একটি ছোট but real project দিয়ে trend-টি বুঝতে শুরু করুন।',
    'একটি demo, case study, note system বা automation flow বানালে learning অনেক দ্রুত হয়।',
    'clear output format, human review এবং source awareness রাখলে quality অনেক ভালো থাকে।',
  ])}
  <h2>কী দিয়ে শুরু করবেন</h2>
  ${renderList([
    `${post.tags[0]} নিয়ে ১টি practical use case বেছে নিন।`,
    `${post.tags[1] ?? post.category} সম্পর্কিত ৩টি tool, workflow বা docs নোট করুন।`,
    'একটি ছোট publishable project বা proof-of-work তৈরি করুন।',
  ], true)}
  <h2>শেষ কথা</h2>
  <p>AI/tech world-এ যারা দ্রুত শিখে ছোট কিন্তু বাস্তব project বানাতে পারে, তারাই সবচেয়ে বেশি এগিয়ে যায়। এই trend-গুলোও সেটাই প্রমাণ করছে।</p>
`;

const TRENDING_POSTS: TrendBlogSeed[] = [
  {
    slug: "gpt-5-4-professional-workflows",
    title: "GPT-5.4 কেন ২০২৬ সালের শুরুতেই প্রো-ওয়ার্কফ্লোতে এত আলোচিত",
    excerpt: "reasoning, instruction-following এবং tool use mature হওয়ায় GPT-5.4 এখন professional workflow automation-এর বড় আলোচ্য বিষয়।",
    date: "৯ মার্চ, ২০২৬",
    imageSeed: "gpt54-workflows",
    category: "এআই ট্রেন্ড",
    tags: [
      "GPT-5.4",
      "Reasoning",
      "Automation"
    ]
  },
  {
    slug: "multilingual-ai-and-bengali-opportunity",
    title: "Multilingual AI wave-এ বাংলা কনটেন্ট ও প্রোডাক্টের সুযোগ কোথায়",
    excerpt: "regional language data, UX আর education product-এর সুযোগ global AI wave-এর সাথে দ্রুত বড় হচ্ছে।",
    date: "৮ মার্চ, ২০২৬",
    imageSeed: "bengali-ai-opportunity",
    category: "বাংলা এআই",
    tags: [
      "Bangla AI",
      "Multilingual",
      "Regional Products"
    ]
  },
  {
    slug: "founder-guide-to-agentic-startups-in-2026",
    title: "২০২৬-এ agentic startup বানাতে হলে founder-দের কী বদলাতে হবে",
    excerpt: "workflow-first চিন্তা, narrow scope আর strong eval ছাড়া agentic startup টেকসই হওয়া কঠিন।",
    date: "৭ মার্চ, ২০২৬",
    imageSeed: "agentic-startups",
    category: "স্টার্টআপ",
    tags: [
      "Agentic Startup",
      "Founder Guide",
      "AI Business"
    ]
  },
  {
    slug: "ai-coding-agents-in-real-teams",
    title: "AI coding agent এখন real team workflow-এ কোথায় সবচেয়ে কার্যকর",
    excerpt: "PR prep, test generation, refactor draft আর docs update-এ AI agent খুব দ্রুত value দিচ্ছে।",
    date: "৬ মার্চ, ২০২৬",
    imageSeed: "real-team-coding",
    category: "কোডিং এআই",
    tags: [
      "Coding Agent",
      "Developer Team",
      "Software Engineering"
    ]
  },
  {
    slug: "how-creators-should-build-an-ai-content-system",
    title: "AI content system: creator-রা ২০২৬-এ কীভাবে smarter workflow বানাবে",
    excerpt: "idea sourcing, draft, design, edit আর distribution - সবকিছুর clear flow দরকার।",
    date: "৬ মার্চ, ২০২৬",
    imageSeed: "creator-system",
    category: "ক্রিয়েটর ইকোনমি",
    tags: [
      "Content System",
      "Creator AI",
      "Workflow"
    ]
  },
  {
    slug: "why-ai-productivity-tools-still-need-human-review",
    title: "AI productivity tools powerful হলেও human review কেন এখনও বাধ্যতামূলক",
    excerpt: "speed বেড়েছে ঠিকই, কিন্তু important work-এ verification, taste এবং accountability ছাড়া AI workflow ঝুঁকিপূর্ণ।",
    date: "৫ মার্চ, ২০২৬",
    imageSeed: "human-review",
    category: "প্রোডাক্টিভিটি এআই",
    tags: [
      "Human Review",
      "AI Productivity",
      "Quality Control"
    ]
  },
  {
    slug: "gpt-5-4-toolkits-for-small-teams",
    title: "ছোট টিমের জন্য GPT-5.4 toolkit কেন এত বড় leverage",
    excerpt: "lean team এখন কম লোক নিয়ে বেশি research, ops আর content flow চালাতে পারছে।",
    date: "৪ মার্চ, ২০২৬",
    imageSeed: "small-team-toolkit",
    category: "এআই ট্রেন্ড",
    tags: [
      "Small Teams",
      "GPT-5.4",
      "Ops"
    ]
  },
  {
    slug: "ai-evals-are-becoming-a-core-team-function",
    title: "AI evals এখন কেন আলাদা team function হয়ে যাচ্ছে",
    excerpt: "consistent eval ছাড়া production AI trust করা কঠিন হয়ে যাচ্ছে।",
    date: "১ মার্চ, ২০২৬",
    imageSeed: "ai-evals",
    category: "ডেভেলপার টুলিং",
    tags: [
      "AI Evals",
      "Quality",
      "Testing"
    ]
  },
  {
    slug: "claude-sonnet-4-6-one-million-context",
    title: "১ মিলিয়ন context window এখন কেন serious product strategy",
    excerpt: "long-context model দেখাচ্ছে, বড় knowledge base, repo এবং document stack একসাথে handle করা practical হয়ে যাচ্ছে।",
    date: "১৭ ফেব্রুয়ারি, ২০২৬",
    imageSeed: "million-context",
    category: "এআই ট্রেন্ড",
    tags: [
      "Claude 4.6",
      "Long Context",
      "Knowledge Work"
    ]
  },
  {
    slug: "one-million-token-context-normalizing",
    title: "Huge context window normal হলে product architecture কীভাবে বদলায়",
    excerpt: "১ মিলিয়ন token context app design, retrieval pattern আর user expectation বদলে দিচ্ছে।",
    date: "১৮ ফেব্রুয়ারি, ২০২৬",
    imageSeed: "huge-context",
    category: "ডেভেলপার টুলিং",
    tags: [
      "Long Context",
      "Architecture",
      "AI Product"
    ]
  },
  {
    slug: "ai-browsers-and-the-future-of-navigation",
    title: "AI browser trend: navigation layer-ই কি পরের battleground?",
    excerpt: "browser-এ built-in AI agent, summary, compare এবং autofill capability web usage pattern বদলে দিতে পারে।",
    date: "২৩ ফেব্রুয়ারি, ২০২৬",
    imageSeed: "ai-browser",
    category: "ওয়েব ট্রেন্ড",
    tags: [
      "AI Browser",
      "Navigation",
      "Web UX"
    ]
  },
  {
    slug: "offline-private-ai-will-grow-faster-than-expected",
    title: "Offline-private AI কি ধারণার চেয়ে দ্রুত বড় হবে?",
    excerpt: "privacy-sensitive use case আর local responsiveness-এর কারণে offline AI adoption দ্রুত বাড়তে পারে।",
    date: "২২ জানুয়ারি, ২০২৬",
    imageSeed: "offline-private-ai",
    category: "মোবাইল এআই",
    tags: [
      "Offline AI",
      "Private AI",
      "On-device"
    ]
  },
  {
    slug: "watermarking-provenance-and-trust-in-generated-media",
    title: "Generated media provenance কেন ২০২৬-এ আরও জরুরি",
    excerpt: "AI-generated ছবি, ভিডিও আর audio বাড়ার সাথে সাথে provenance, watermarking আর trust signal বাস্তব প্রয়োজন।",
    date: "২০ জানুয়ারি, ২০২৬",
    imageSeed: "provenance-trust",
    category: "এআই সেফটি",
    tags: [
      "Provenance",
      "Watermarking",
      "AI Safety"
    ]
  },
  {
    slug: "open-responses-and-multi-model-stack",
    title: "Open response stack কেন multi-model ভবিষ্যতের ভিত্তি হয়ে উঠছে",
    excerpt: "response orchestration, tool calling এবং provider mixing এখন serious engineering trend।",
    date: "১৬ জানুয়ারি, ২০২৬",
    imageSeed: "multi-model-stack",
    category: "ডেভেলপার টুলিং",
    tags: [
      "Responses API",
      "Multi-Model",
      "Tool Calling"
    ]
  },
  {
    slug: "sovereign-ai-and-national-compute-strategy",
    title: "Sovereign AI এখন কেন জাতীয় নীতির আলোচনায়",
    excerpt: "নিজস্ব compute, data governance আর language capability এখন বড় কৌশলগত আলোচনার বিষয়।",
    date: "১৪ জানুয়ারি, ২০২৬",
    imageSeed: "sovereign-ai",
    category: "এআই নীতি",
    tags: [
      "Sovereign AI",
      "Compute Policy",
      "National Strategy"
    ]
  },
  {
    slug: "veo-3-1-and-the-new-video-creator-stack",
    title: "Veo 3.1 এর পর short-form video creator stack কেন বদলে যাচ্ছে",
    excerpt: "text prompt, ingredient image, cinematic motion আর faster iteration creator workflow-কে আরও mainstream করছে।",
    date: "১৩ জানুয়ারি, ২০২৬",
    imageSeed: "veo31-video",
    category: "ভিডিও এআই",
    tags: [
      "Veo 3.1",
      "Video AI",
      "Creator Economy"
    ]
  },
  {
    slug: "gpt-image-workflows-in-2026",
    title: "AI image workflow এখন কেন শুধু design না, full content pipeline",
    excerpt: "image generation tools এখন ad creative, product mockup, thumbnail এবং rapid experimentation-এর core অংশ।",
    date: "১২ জানুয়ারি, ২০২৬",
    imageSeed: "image-workflows",
    category: "ক্রিয়েটিভ এআই",
    tags: [
      "Image Generation",
      "Design Workflow",
      "Creative AI"
    ]
  },
  {
    slug: "browser-agents-and-task-completion-metrics",
    title: "Browser agent-এর future metric: smart answer না finished task?",
    excerpt: "agent product design-এ answer quality থেকে task completion success-এর দিকে focus সরে যাচ্ছে।",
    date: "১২ জানুয়ারি, ২০২৬",
    imageSeed: "task-completion",
    category: "প্রোডাক্ট ডিজাইন",
    tags: [
      "Browser Agents",
      "Task Completion",
      "Product Metrics"
    ]
  },
  {
    slug: "veo-film-awards-and-ai-cinema-experiments",
    title: "AI cinema experiment এখন creator marketing-এর বড় playground",
    excerpt: "AI film award, festival experiment এবং cinematic demo culture branded storytelling-এর নতুন direction তৈরি করছে।",
    date: "১২ জানুয়ারি, ২০২৬",
    imageSeed: "ai-cinema",
    category: "ক্রিয়েটিভ এআই",
    tags: [
      "AI Cinema",
      "Creative Marketing",
      "Veo"
    ]
  },
  {
    slug: "deep-research-and-trusted-sources",
    title: "Deep research mode এখন কেন শুধু feature না, research habit",
    excerpt: "trusted source selection, citation workflow এবং multi-step synthesis-এর কারণে deep research tools আলাদা ক্যাটাগরি হয়ে উঠছে।",
    date: "১০ ফেব্রুয়ারি, ২০২৬",
    imageSeed: "deep-research",
    category: "রিসার্চ এআই",
    tags: [
      "Deep Research",
      "Citation",
      "Analysis"
    ]
  },
  {
    slug: "interoperable-ai-stacks-and-mcp-style-workflows",
    title: "Interoperable AI stack কেন ২০২৬-এর product builders-এর জন্য জরুরি",
    excerpt: "tool integration standard, context portability এবং workflow interoperability ছাড়া বড় AI product scale করা কঠিন।",
    date: "৯ ফেব্রুয়ারি, ২০২৬",
    imageSeed: "interoperable-stack",
    category: "ডেভেলপার টুলিং",
    tags: [
      "Interoperability",
      "MCP",
      "AI Stack"
    ]
  },
  {
    slug: "personal-ai-across-chat-phone-and-glasses",
    title: "Personal AI এখন chat box ছাড়িয়ে phone ও glasses-এ কেন ছড়াচ্ছে",
    excerpt: "AI assistant ecosystem ambient, wearable এবং contextual computing-এর দিকে যাচ্ছে।",
    date: "২৭ জানুয়ারি, ২০২৬",
    imageSeed: "ambient-ai",
    category: "কনজিউমার এআই",
    tags: [
      "Personal AI",
      "Wearables",
      "Ambient Computing"
    ]
  },
  {
    slug: "ai-chips-are-now-a-product-strategy-issue",
    title: "AI chips এখন শুধু hardware story না, product strategy issue",
    excerpt: "চিপ capability, inference efficiency আর deployment target এখন product roadmap-এর গুরুত্বপূর্ণ প্রশ্ন।",
    date: "২ ফেব্রুয়ারি, ২০২৬",
    imageSeed: "ai-chips-strategy",
    category: "হার্ডওয়্যার",
    tags: [
      "AI Chips",
      "Inference",
      "Product Strategy"
    ]
  },
  {
    slug: "ai-in-education-national-rollouts",
    title: "জাতীয় পর্যায়ে AI in education কেন ২০২৬-এর বড় আলোচ্য বিষয়",
    excerpt: "সরকার, শিক্ষা মন্ত্রণালয় এবং বড় AI company-র partnership এখন national-scale AI literacy rollout তৈরি করছে।",
    date: "৫ জানুয়ারি, ২০২৬",
    imageSeed: "ai-education",
    category: "এডটেক এআই",
    tags: [
      "AI Education",
      "EdTech",
      "AI Literacy"
    ]
  },
  {
    slug: "grok-business-and-enterprise-ai-packaging",
    title: "Enterprise AI packaging trend: শুধু model না, bundle কেন গুরুত্বপূর্ণ",
    excerpt: "enterprise market-এ model quality-এর পাশাপাশি admin control, data policy আর pricing bundle equally জরুরি।",
    date: "৩০ ডিসেম্বর, ২০২৫",
    imageSeed: "enterprise-bundle",
    category: "এন্টারপ্রাইজ এআই",
    tags: [
      "Enterprise AI",
      "Business AI",
      "Packaging"
    ]
  },
  {
    slug: "small-models-big-opportunity",
    title: "Small model trend: সব সমস্যায় বড় model দরকার হয় না",
    excerpt: "compact, cheaper, faster model-গুলো narrow task-এ surprising value দিচ্ছে এবং product economics উন্নত করছে।",
    date: "১৮ ডিসেম্বর, ২০২৫",
    imageSeed: "small-models",
    category: "এআই ট্রেন্ড",
    tags: [
      "Small Models",
      "Efficiency",
      "AI Economics"
    ]
  },
  {
    slug: "bedrock-agentcore-and-production-agents",
    title: "Production agent stack কেন আলাদা category হয়ে যাচ্ছে",
    excerpt: "agent build করা সহজ, কিন্তু deploy, observe, secure এবং scale করা কঠিন।",
    date: "১০ ডিসেম্বর, ২০২৫",
    imageSeed: "production-agents",
    category: "ডেভেলপার টুলিং",
    tags: [
      "AgentCore",
      "Production AI",
      "Observability"
    ]
  },
  {
    slug: "robotics-world-models-and-ai-planning",
    title: "Robotics world model trend কেন software founders-কেও ভাবানো উচিত",
    excerpt: "environment understanding, planning আর simulation research software AI product-এর জন্যও গুরুত্বপূর্ণ ইঙ্গিত দিচ্ছে।",
    date: "২১ অক্টোবর, ২০২৫",
    imageSeed: "robotics-world-models",
    category: "রোবোটিক্স",
    tags: [
      "Robotics",
      "World Models",
      "Planning"
    ]
  },
  {
    slug: "multimodal-video-with-sound-is-the-next-wave",
    title: "Text-to-video with sound কেন next big creator trend",
    excerpt: "silent clip থেকে sound-aware scene generation-এ যাওয়ায় AI video আরও realistic content format-এর দিকে যাচ্ছে।",
    date: "১ অক্টোবর, ২০২৫",
    imageSeed: "video-with-sound",
    category: "ভিডিও এআই",
    tags: [
      "Multimodal Video",
      "Audio",
      "Creator Tech"
    ]
  },
  {
    slug: "sora-2-and-native-audio-storytelling",
    title: "Sora 2-এর পর AI video storytelling কেন আরও cinematic হয়ে উঠছে",
    excerpt: "video generation-এর নতুন দিক হলো richer motion, scene continuity এবং audio-aware storytelling pipeline।",
    date: "৩০ সেপ্টেম্বর, ২০২৫",
    imageSeed: "sora2-storytelling",
    category: "ভিডিও এআই",
    tags: [
      "Sora 2",
      "Storytelling",
      "Generative Video"
    ]
  },
  {
    slug: "claude-sonnet-4-5-coding-agents",
    title: "Claude Sonnet 4.5 coding agents কেন engineers-এর favourite আলোচনায়",
    excerpt: "strong code editing, long context আর stable instruction-following coding agent workflow-কে আরও জনপ্রিয় করেছে।",
    date: "২৯ সেপ্টেম্বর, ২০২৫",
    imageSeed: "claude45-coding",
    category: "কোডিং এআই",
    tags: [
      "Claude 4.5",
      "Coding Agents",
      "Developer Workflow"
    ]
  },
  {
    slug: "claude-code-memory-checkpoints-vscode",
    title: "Claude Code, memory আর checkpoints কেন IDE experience পাল্টে দিচ্ছে",
    excerpt: "editor-এর ভেতরে memory, checkpoint আর iterative patching যুক্ত হওয়ায় AI coding অনেক বেশি serious হয়ে উঠছে।",
    date: "২৯ সেপ্টেম্বর, ২০২৫",
    imageSeed: "ide-memory",
    category: "ডেভেলপার টুলিং",
    tags: [
      "Claude Code",
      "IDE",
      "Memory"
    ]
  },
  {
    slug: "visual-intelligence-live-translation-and-phone-ai",
    title: "Phone AI trend: visual intelligence আর live translation কেন mass-market feature",
    excerpt: "camera, voice আর real-time translation যুক্ত হওয়ায় smartphone AI demo না, everyday utility-তে ঢুকছে।",
    date: "৯ সেপ্টেম্বর, ২০২৫",
    imageSeed: "phone-ai-utility",
    category: "মোবাইল এআই",
    tags: [
      "Visual Intelligence",
      "Live Translation",
      "Smartphone AI"
    ]
  },
  {
    slug: "agent-memory-and-state-management",
    title: "Agent memory ও state management ছাড়া বড় automation কেন ভেঙে পড়ে",
    excerpt: "stateful agent design এখন production automation-এ reliability-এর মূল শর্ত।",
    date: "২ সেপ্টেম্বর, ২০২৫",
    imageSeed: "agent-memory",
    category: "এজেন্ট এআই",
    tags: [
      "Agent Memory",
      "State Management",
      "Reliability"
    ]
  },
  {
    slug: "rtx-pro-servers-and-enterprise-private-ai",
    title: "Private enterprise AI কেন RTX Pro server trend-কে বাড়াচ্ছে",
    excerpt: "সব inference public cloud-এ যাবে না; enterprise private AI stack-এর demand বাড়ায় on-prem GPU discussion সামনে এসেছে।",
    date: "১১ আগস্ট, ২০২৫",
    imageSeed: "private-enterprise-ai",
    category: "এআই ইনফ্রা",
    tags: [
      "RTX Pro",
      "On-Prem AI",
      "Enterprise Infrastructure"
    ]
  },
  {
    slug: "notebooklm-video-overviews-for-learning",
    title: "NotebookLM video overview trend: শেখার কনটেন্ট কেন আরও multimodal হচ্ছে",
    excerpt: "note, source, summary, audio আর video explanation - সব একসাথে আসায় AI-assisted learning আরও practical।",
    date: "২৯ জুলাই, ২০২৫",
    imageSeed: "notebooklm-video",
    category: "এডটেক এআই",
    tags: [
      "NotebookLM",
      "Learning",
      "Multimodal Education"
    ]
  },
  {
    slug: "gemini-in-gmail-and-document-workflows",
    title: "Mail, docs, sheet-এর ভেতরে AI কেন সবচেয়ে বেশি ব্যবহারযোগ্য হয়ে উঠছে",
    excerpt: "standalone chatbot-এর চেয়ে inbox, document আর presentation workflow-এর ভেতরের AI অনেক user-এর কাছে বেশি useful।",
    date: "১৪ জুলাই, ২০২৫",
    imageSeed: "mail-docs-ai",
    category: "প্রোডাক্টিভিটি এআই",
    tags: [
      "Gmail AI",
      "Workspace",
      "Document Workflow"
    ]
  },
  {
    slug: "chatgpt-agent-from-research-to-action",
    title: "ChatGPT agent trend: research থেকে action-এ বাজার কেন যাচ্ছে",
    excerpt: "AI এখন summary দিয়েই থামছে না; form fill, comparison, browsing এবং execution-level কাজের দিকে এগোচ্ছে।",
    date: "১৭ জুলাই, ২০২৫",
    imageSeed: "chatgpt-agent",
    category: "এজেন্ট এআই",
    tags: [
      "ChatGPT Agent",
      "Task Automation",
      "Agentic AI"
    ]
  },
  {
    slug: "browser-tools-for-agents",
    title: "Browser tools for agents: web-native automation কেন এত দ্রুত বাড়ছে",
    excerpt: "API না থাকলেও browser interaction দিয়ে কাজ হওয়ায় web-native agent automation অনেক use case-এ practical।",
    date: "১৭ জুলাই, ২০২৫",
    imageSeed: "browser-agents",
    category: "এজেন্ট এআই",
    tags: [
      "Browser Tool",
      "Web Automation",
      "Agents"
    ]
  },
  {
    slug: "veo-3-viral-video-wave",
    title: "Veo 3 viral wave: AI video এখন social media growth engine কেন",
    excerpt: "short-form platforms-এ AI video-এর cinematic quality creator economy-কে নতুন দিকে ঠেলে দিচ্ছে।",
    date: "৩ জুলাই, ২০২৫",
    imageSeed: "viral-video-wave",
    category: "ভিডিও এআই",
    tags: [
      "Veo 3",
      "Social Media",
      "Creator Tools"
    ]
  },
  {
    slug: "apple-intelligence-on-device-ai-shift",
    title: "On-device AI shift: Apple Intelligence trend কেন private computing-কে সামনে আনছে",
    excerpt: "cloud AI যত বড় হচ্ছে, ততই private, local এবং latency-friendly on-device AI-ও আলাদা জায়গা নিচ্ছে।",
    date: "৯ জুন, ২০২৫",
    imageSeed: "on-device-ai",
    category: "মোবাইল এআই",
    tags: [
      "Apple Intelligence",
      "On-device AI",
      "Privacy"
    ]
  },
  {
    slug: "meta-ai-app-and-personal-ai-layer",
    title: "Meta AI app trend: personal AI layer কি social graph-এর ওপর দাঁড়াবে?",
    excerpt: "social context, voice interaction এবং consumer habit-এর ওপর দাঁড়িয়ে personal AI app category নতুন প্রতিযোগিতা তৈরি করছে।",
    date: "২৯ এপ্রিল, ২০২৫",
    imageSeed: "personal-ai-layer",
    category: "কনজিউমার এআই",
    tags: [
      "Meta AI",
      "Personal AI",
      "Consumer Tech"
    ]
  },
  {
    slug: "ai-memory-and-personalization-race",
    title: "Memory race: assistant যদি আপনাকে মনে রাখে, product design কেমন বদলায়",
    excerpt: "AI memory এখন novelty না; personalization, follow-up quality এবং long-term usefulness-এর জন্য core feature হয়ে উঠছে।",
    date: "২৮ এপ্রিল, ২০২৫",
    imageSeed: "memory-race",
    category: "প্রোডাক্ট ডিজাইন",
    tags: [
      "Memory",
      "Personalization",
      "AI UX"
    ]
  },
  {
    slug: "microsoft-agentic-ai-enterprise-shift",
    title: "Enterprise-এ agentic AI push কেন Microsoft narrative-কে শক্ত করেছে",
    excerpt: "workspace, security, identity এবং AI assistant একসাথে থাকলে enterprise adoption friction কমে।",
    date: "২৮ এপ্রিল, ২০২৫",
    imageSeed: "enterprise-shift",
    category: "এন্টারপ্রাইজ এআই",
    tags: [
      "Microsoft",
      "Agentic AI",
      "Enterprise"
    ]
  },
  {
    slug: "gpt-4-1-long-context-coding-era",
    title: "GPT-4.1 era কেন coding assistant-কে repo-level thinking-এর দিকে নিচ্ছে",
    excerpt: "long context, better instruction following এবং tool use-এর কারণে coding assistant project-level কাজ বেশি ধরছে।",
    date: "১৪ এপ্রিল, ২০২৫",
    imageSeed: "repo-level-coding",
    category: "কোডিং এআই",
    tags: [
      "GPT-4.1",
      "Coding AI",
      "Long Context"
    ]
  },
  {
    slug: "llama-4-and-native-multimodal-open-model-race",
    title: "Llama 4 ও open model race কেন ২০২৫-২৬ এ আরও গরম",
    excerpt: "open-weight model discussion এখন enterprise flexibility আর custom deployment-এর জন্যও demand পাচ্ছে।",
    date: "৫ এপ্রিল, ২০২৫",
    imageSeed: "open-model-race",
    category: "ওপেন মডেল",
    tags: [
      "Llama 4",
      "Open Models",
      "Multimodal AI"
    ]
  },
  {
    slug: "copilot-plus-pc-and-local-assistance",
    title: "AI PC trend: local assistant experience কি laptop upgrade cycle বদলাবে?",
    excerpt: "AI PC class দেখাচ্ছে, AI এখন শুধু app না; hardware buying decision-এও ভূমিকা রাখছে।",
    date: "৪ এপ্রিল, ২০২৫",
    imageSeed: "ai-pc",
    category: "হার্ডওয়্যার",
    tags: [
      "AI PC",
      "Copilot+",
      "Local Inference"
    ]
  },
  {
    slug: "gemini-2-5-thinking-models",
    title: "Gemini 2.5 thinking model কেন deep reasoning race-কে আরও ত্বরান্বিত করেছে",
    excerpt: "thinking model category এখন benchmark-এর বাইরে গিয়ে real analysis আর planning-এর বড় বাজার তৈরি করছে।",
    date: "২৫ মার্চ, ২০২৫",
    imageSeed: "gemini25-thinking",
    category: "এআই ট্রেন্ড",
    tags: [
      "Gemini 2.5",
      "Thinking Models",
      "Reasoning"
    ]
  },
  {
    slug: "nvidia-blackwell-ultra-and-ai-factory-buildout",
    title: "Blackwell Ultra ও AI factory buildout কেন infrastructure race-এর কেন্দ্র",
    excerpt: "frontier model race যত বাড়ছে, compute infrastructure ততই strategic discussion-এর কেন্দ্রে।",
    date: "১৮ মার্চ, ২০২৫",
    imageSeed: "blackwell-ultra",
    category: "এআই ইনফ্রা",
    tags: [
      "NVIDIA",
      "Blackwell Ultra",
      "AI Factory"
    ]
  },
  {
    slug: "digital-twins-physics-ai-and-industrial-simulation",
    title: "Digital twins ও physics AI কেন industrial AI-কে নতুন স্তরে নিচ্ছে",
    excerpt: "factory, robotics, supply chain এবং design simulation-এ AI এখন environment understanding-ও শিখছে।",
    date: "১৮ মার্চ, ২০২৫",
    imageSeed: "digital-twins",
    category: "ইন্ডাস্ট্রিয়াল এআই",
    tags: [
      "Digital Twins",
      "Physics AI",
      "Simulation"
    ]
  },
  {
    slug: "gpt-4-5-creative-and-conversational-wave",
    title: "GPT-4.5 wave: conversational quality এখনও কেন বড় পার্থক্য গড়ে",
    excerpt: "সব আলোচনায় reasoning মডেল থাকলেও natural tone, creativity এবং cleaner writing-এর demand কমেনি।",
    date: "২৭ ফেব্রুয়ারি, ২০২৫",
    imageSeed: "gpt45-creative",
    category: "এআই ট্রেন্ড",
    tags: [
      "GPT-4.5",
      "Writing",
      "Creative AI"
    ]
  },
  {
    slug: "claude-3-7-extended-thinking-and-tools",
    title: "Claude 3.7 extended thinking কেন analysis-heavy কাজের নতুন benchmark",
    excerpt: "extended thinking mode দেখিয়েছে যে slower, more deliberate answer অনেক professional task-এ আলাদা value দিতে পারে।",
    date: "২৪ ফেব্রুয়ারি, ২০২৫",
    imageSeed: "extended-thinking",
    category: "এআই ট্রেন্ড",
    tags: [
      "Claude 3.7",
      "Extended Thinking",
      "Analysis"
    ]
  },
  {
    slug: "grok-3-reasoning-and-consumer-hype",
    title: "Grok 3 নিয়ে এত আলোচনা কেন: reasoning, speed আর consumer hype-এর মিশ্রণ",
    excerpt: "frontier model competition এখন শুধু labs-এর লড়াই না; consumer attention আর ecosystem narrative-ও বড় ভূমিকা রাখছে।",
    date: "১৯ ফেব্রুয়ারি, ২০২৫",
    imageSeed: "grok3-hype",
    category: "এআই ট্রেন্ড",
    tags: [
      "Grok 3",
      "Reasoning",
      "Consumer AI"
    ]
  },
  {
    slug: "anthropic-economic-index-and-ai-at-work",
    title: "AI workplace index trend: কোন কাজগুলো সবচেয়ে দ্রুত বদলাচ্ছে",
    excerpt: "workplace usage data দেখাচ্ছে AI adoption এখন theory না; writing, coding আর analysis-এ বাস্তব ব্যবহার বাড়ছে।",
    date: "১০ ফেব্রুয়ারি, ২০২৫",
    imageSeed: "ai-at-work",
    category: "ক্যারিয়ার",
    tags: [
      "AI at Work",
      "Jobs",
      "Productivity"
    ]
  },
  {
    slug: "ai-search-mode-and-answer-engines",
    title: "AI search mode এখন কেন classic search-এর বড় চ্যালেঞ্জার",
    excerpt: "search engine result page থেকে answer engine experience-এ shift হওয়ায় content, SEO এবং discovery strategy বদলে যাচ্ছে।",
    date: "৬ মার্চ, ২০২৫",
    imageSeed: "ai-search-mode",
    category: "সার্চ এআই",
    tags: [
      "AI Search",
      "Answer Engine",
      "Discovery"
    ]
  },
  {
    slug: "operator-and-computer-use-interfaces",
    title: "Computer-use interface কেন AI product design-এর নতুন frontier",
    excerpt: "GUI পড়া, button click করা আর web flow navigate করা এখন AI UX-এর গুরুত্বপূর্ণ অংশ।",
    date: "১১ মার্চ, ২০২৫",
    imageSeed: "computer-use-ui",
    category: "এজেন্ট এআই",
    tags: [
      "Operator",
      "Computer Use",
      "Product Design"
    ]
  },
  {
    slug: "bedrock-multi-agent-collaboration",
    title: "Multi-agent collaboration কেন enterprise architecture-এর আলোচনায়",
    excerpt: "এক agent সব কাজ করবে - এই ধারণা বদলাচ্ছে; specialized agent team এখন বড় design pattern।",
    date: "১০ মার্চ, ২০২৫",
    imageSeed: "multi-agent-collab",
    category: "এন্টারপ্রাইজ এআই",
    tags: [
      "Bedrock",
      "Multi-Agent",
      "Enterprise Automation"
    ]
  },
  {
    slug: "gemini-app-deep-research-gems-and-personalization",
    title: "Gemini app-এর deep research, Gems আর personalization trend কেন বড় কথা",
    excerpt: "AI assistant এখন generic chatbot না থেকে ব্যক্তিগত workspace এবং reusable expert profile-এর দিকে যাচ্ছে।",
    date: "১৩ মার্চ, ২০২৫",
    imageSeed: "gems-personalization",
    category: "প্রোডাক্টিভিটি এআই",
    tags: [
      "Gemini App",
      "Gems",
      "Personalization"
    ]
  }
] as TrendBlogSeed[];

const LEGACY_POSTS: BlogPost[] = [
  {
    id: "",
    slug: "how-to-start-freelancing-in-bangladesh",
    title: "বাংলাদেশে ফ্রিল্যান্সিং শুরু করার পূর্ণাঙ্গ গাইড ২০২৪",
    excerpt: "আপনি কি বাংলাদেশে বসে ফ্রিল্যান্সিং শুরু করতে চান? এই ব্লগে আমরা আলোচনা করব কীভাবে সঠিক স্কিল নির্বাচন করবেন এবং প্রথম কাজ পাবেন।",
    content: "<h2>ফ্রিল্যান্সিং কী এবং কেন করবেন?</h2><p>ফ্রিল্যান্সিং মানে হলো কোনো নির্দিষ্ট প্রতিষ্ঠানের অধীনে না থেকে স্বাধীনভাবে কাজ করা।</p><h2>সঠিক স্কিল নির্বাচন</h2><p>ওয়েব ডেভেলপমেন্ট, গ্রাফিক ডিজাইন, ডিজিটাল মার্কেটিং এবং কনটেন্ট রাইটিং জনপ্রিয় ক্ষেত্র।</p><h2>কোথায় কাজ খুঁজবেন?</h2><p>আপওয়ার্ক, ফিভার এবং ফ্রিল্যান্সার ডট কমে ভালো পোর্টফোলিও নিয়ে শুরু করতে পারেন।</p>",
    author: "দেশি কোর্স টিম",
    date: "৮ মার্চ, ২০২৪",
    image: "https://picsum.photos/seed/freelance/800/600",
    category: "ফ্রিল্যান্সিং",
    tags: [
      "Freelancing",
      "Career",
      "Bangladesh"
    ]
  },
  {
    id: "",
    slug: "top-programming-languages-2024",
    title: "২০২৪ সালে শেখার জন্য সেরা ৫টি প্রোগ্রামিং ল্যাঙ্গুয়েজ",
    excerpt: "প্রোগ্রামিং শিখতে চান কিন্তু বুঝতে পারছেন না কোনটি দিয়ে শুরু করবেন? ২০২৪ সালের ডিমান্ড অনুযায়ী সেরা ৫টি ল্যাঙ্গুয়েজ দেখে নিন।",
    content: "<h2>কেন প্রোগ্রামিং শিখবেন?</h2><p>প্রযুক্তির সাথে তাল মিলিয়ে চলতে প্রোগ্রামিং শেখার বিকল্প নেই।</p><h2>সেরা ৫টি ল্যাঙ্গুয়েজ</h2><ol><li>পাইথন</li><li>জাভাস্ক্রিপ্ট</li><li>জাভা</li><li>টাইপস্ক্রিপ্ট</li><li>গো</li></ol><h2>কীভাবে শুরু করবেন?</h2><p>একটি ল্যাঙ্গুয়েজ বেছে নিয়ে নিয়মিত প্র্যাকটিস করুন।</p>",
    author: "দেশি কোর্স টিম",
    date: "৫ মার্চ, ২০২৪",
    image: "https://picsum.photos/seed/code/800/600",
    category: "প্রোগ্রামিং",
    tags: [
      "Programming",
      "Python",
      "JavaScript"
    ]
  },
  {
    id: "",
    slug: "importance-of-ui-ux-design",
    title: "আধুনিক ব্যবসায় ইউআই/ইউএক্স ডিজাইনের গুরুত্ব",
    excerpt: "একটি ওয়েবসাইটের সাফল্য অনেকাংশেই নির্ভর করে তার ইউজার ইন্টারফেস এবং ইউজার এক্সপেরিয়েন্সের ওপর।",
    content: "<h2>ইউআই এবং ইউএক্স কী?</h2><p>ইউআই হলো ইউজার ইন্টারফেস, আর ইউএক্স হলো ইউজার এক্সপেরিয়েন্স।</p><h2>ব্যবসায় এর প্রভাব</h2><p>ভালো ডিজাইন গ্রাহকের আস্থা বাড়ায় এবং কনভার্সন রেট বৃদ্ধি করে।</p><h2>ডিজাইন শেখার ধাপ</h2><p>ডিজাইন সেন্স, টুলস এবং কেস স্টাডি - এই তিনটি বিষয়ে জোর দিন।</p>",
    author: "দেশি কোর্স টিম",
    date: "১ মার্চ, ২০২৪",
    image: "https://picsum.photos/seed/design/800/600",
    category: "ডিজাইন",
    tags: [
      "UI/UX",
      "Design",
      "Business"
    ]
  }
] as BlogPost[];

const BASE_BLOG_POSTS: Omit<BlogPost, 'id'>[] = [
  ...PROMOTIONAL_BLOG_POSTS,
  ...TRENDING_POSTS.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: createTrendContent(post),
    author: 'দেশি কোর্স রিসার্চ ডেস্ক',
    date: post.date,
    image: `https://picsum.photos/seed/${post.imageSeed}/1200/800`,
    category: post.category,
    tags: post.tags,
  })),
  ...LEGACY_POSTS.map(({ id: _id, ...post }) => post),
];

export const BLOG_POSTS: BlogPost[] = BASE_BLOG_POSTS.map((post, index) => ({
  ...post,
  id: String(index + 1),
}));
