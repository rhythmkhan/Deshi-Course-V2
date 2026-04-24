import { BLOG_POSTS } from '@/lib/blog-data';
import { BUNDLE_CATALOG } from '@/lib/bundle-catalog';
import { getBundleDetailBySlug } from '@/lib/bundle-details';
import { COURSE_CATALOG, FEATURED_COURSES } from '@/lib/course-catalog';
import { getCourseBySlug } from '@/lib/course-details';
import { FAQ_ITEMS } from '@/lib/faq-data';
import { resolveDeliveryRequirements } from '@/lib/order-delivery';
import { getProductDetailBySlug } from '@/lib/product-details';
import { SHOP_CATALOG } from '@/lib/shop-catalog';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingRelationError } from '@/lib/supabase/errors';

const FALLBACK_TESTIMONIALS = [
  {
    quote:
      'শিক্ষকদের industry experience আর বাস্তব project flow complex ধারণাগুলো সহজ করেছে।',
    name: 'সারা চেন',
    role: 'সিইও, লেটস কানেক্ট',
    avatar_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    rating: 5,
    is_published: true,
    sort_order: 0,
  },
  {
    quote:
      'Practical content আর support আমাকে real-world challenge handle করতে confidence দিয়েছে।',
    name: 'জেনিফার ওয়ালশ',
    role: 'ম্যানেজার, লেটস কানেক্ট',
    avatar_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    rating: 5,
    is_published: true,
    sort_order: 1,
  },
];

const FALLBACK_HOMEPAGE_SECTIONS = [
  {
    section_key: 'hero',
    title: 'দক্ষতা অর্জন করুন। কাগজ নয়!',
    subtitle:
      'ইন-ডিমান্ড স্কিল শিখে আগামীর ক্যারিয়ার গড়ুন। ২,০০০+ শিক্ষার্থীর ভরসার platform।',
    body: {
      primaryCtaLabel: 'এখনই শুরু করুন',
      primaryCtaHref: '/signin',
      secondaryCtaLabel: 'কোর্স দেখুন',
      secondaryCtaHref: '/courses',
      image: '/hero.webp',
    },
    is_published: true,
    sort_order: 0,
  },
  {
    section_key: 'features',
    title: 'আমাদের কোর্স থেকে কেন শিখবেন?',
    subtitle:
      'মানসম্পন্ন শিক্ষা এবং ব্যবহারিক দক্ষতার ওপর জোর দিয়ে career-ready learning experience।',
    body: {
      items: [
        {
          id: '01',
          title: 'শিখুন',
          description:
            'ইন-ডিমান্ড স্কিল শিখুন বাস্তব উদাহরণ, প্রজেক্ট এবং guided support-এর মাধ্যমে।',
        },
        {
          id: '02',
          title: 'প্র্যাকটিক্যাল করুন',
          description:
            'প্র্যাকটিক্যাল কাজের মাধ্যমে শেখাকে শক্ত করুন এবং বাস্তব সমস্যার সমাধান করতে শিখুন।',
        },
        {
          id: '03',
          title: 'ক্যারিয়ার গড়ুন',
          description:
            'দক্ষতাকে কাজে লাগিয়ে আয়, সুযোগ এবং দীর্ঘমেয়াদি ক্যারিয়ারের ভিত্তি তৈরি করুন।',
        },
      ],
    },
    is_published: true,
    sort_order: 1,
  },
  {
    section_key: 'support',
    title: 'আপনার কি কোনো সাহায্য প্রয়োজন?',
    subtitle: 'আমাদের support team সবসময় পাশে আছে।',
    body: {
      contactMethods: [
        {
          title: 'সরাসরি WhatsApp-এ মেসেজ করুন',
          description:
            'সকাল ১০টা থেকে রাত ৮টা পর্যন্ত WhatsApp support।',
          contact: '+৮৮০ ১৮১৩ ৮৯৬৪০০',
          action: 'মেসেজ করুন',
          href: 'https://wa.me/8801813896400',
          theme: 'whatsapp',
        },
        {
          title: 'লাইভ চ্যাট',
          description: 'Messenger-এ সরাসরি support নিন।',
          contact: 'Messenger support',
          action: 'চ্যাট শুরু করুন',
          href: 'https://www.messenger.com/t/956128257564286',
          theme: 'messenger',
        },
        {
          title: 'ইমেইল সাপোর্ট',
          description: 'বিস্তারিত সমস্যার জন্য email support।',
          contact: 'info@deshicourse.xyz',
          action: 'ইমেইল পাঠান',
          href: 'mailto:info@deshicourse.xyz',
          theme: 'email',
        },
      ],
    },
    is_published: true,
    sort_order: 2,
  },
];

function buildLegacyDeliveryRules() {
  const items = [
    ...COURSE_CATALOG.map((course) => ({
      item_type: 'course' as const,
      item_slug: course.slug,
      title: course.title,
    })),
    ...BUNDLE_CATALOG.map((bundle) => ({
      item_type: 'bundle' as const,
      item_slug: bundle.slug,
      title: bundle.title,
    })),
    ...SHOP_CATALOG.map((product) => ({
      item_type: 'shop' as const,
      item_slug: product.slug,
      title: product.title,
    })),
  ];

  return items.flatMap((item) => {
    const requirements = resolveDeliveryRequirements([
      {
        itemType: item.item_type,
        slug: item.item_slug,
        title: item.title,
      },
    ]);

    return Array.from(requirements.entries()).flatMap(([track, resources]) =>
      Array.from(resources).map((resource, index) => ({
        item_type: item.item_type,
        item_slug: item.item_slug,
        channel: 'telegram_invite',
        position: index,
        is_active: true,
        config: {
          track,
          resource,
        },
      })),
    );
  });
}

async function syncFaqEntries() {
  const supabase = createAdminClient();
  const { error } = await supabase.from('faq_entries').upsert(
    FAQ_ITEMS.map((item, index) => ({
      id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
      scope: 'site',
      scope_slug: null,
      question: item.question,
      answer: item.answer,
      sort_order: index,
      is_published: true,
    })),
    { onConflict: 'id' },
  );

  if (error && !isMissingRelationError(error, 'faq_entries')) {
    throw new Error(`FAQ sync failed: ${error.message}`);
  }
}

async function syncHomepageSections() {
  const supabase = createAdminClient();
  const { error } = await supabase.from('homepage_sections').upsert(
    FALLBACK_HOMEPAGE_SECTIONS,
    { onConflict: 'section_key' },
  );

  if (error && !isMissingRelationError(error, 'homepage_sections')) {
    throw new Error(`Homepage section sync failed: ${error.message}`);
  }
}

async function syncTestimonials() {
  const supabase = createAdminClient();
  const { error } = await supabase.from('testimonials').upsert(
    FALLBACK_TESTIMONIALS.map((testimonial, index) => ({
      id: `10000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
      ...testimonial,
    })),
    { onConflict: 'id' },
  );

  if (error && !isMissingRelationError(error, 'testimonials')) {
    throw new Error(`Testimonial sync failed: ${error.message}`);
  }
}

async function syncDeliveryRules() {
  const supabase = createAdminClient();
  const rules = buildLegacyDeliveryRules();

  const { error } = await supabase.from('delivery_rules').upsert(
    rules,
    { onConflict: 'item_type,item_slug,channel,position' },
  );

  if (error && !isMissingRelationError(error, 'delivery_rules')) {
    throw new Error(`Delivery rule sync failed: ${error.message}`);
  }
}

export async function syncLegacyContentToDatabase() {
  const supabase = createAdminClient();

  const { error: courseError } = await supabase.from('courses').upsert(
    COURSE_CATALOG.map((course, index) => {
      const detail = getCourseBySlug(course.slug);

      return {
        legacy_id: course.id,
        slug: course.slug,
        title: course.title,
        category: course.category,
        level: course.level,
        price: course.price,
        original_price: course.originalPrice,
        image: course.image,
        instructor: course.instructor,
        access_label: course.accessLabel,
        tag: course.tag,
        promo_tag: course.promoTag ?? null,
        feature_metrics: course.featureMetrics,
        short_description: detail?.heroSummary ?? '',
        support_text: detail?.support ?? null,
        detail_content: detail
          ? {
              language: detail.language,
              heroSummary: detail.heroSummary,
              description: detail.description,
              outcomeSummary: detail.outcomeSummary,
              deliverables: detail.deliverables,
              audience: detail.audience,
              workflow: detail.workflow,
              tools: detail.tools,
              support: detail.support,
              facts: detail.facts,
              faq: detail.faq,
              modules: detail.modules ?? [],
            }
          : {},
        gallery: [course.image],
        is_published: true,
        is_featured: FEATURED_COURSES.some((entry) => entry.slug === course.slug),
        sort_order: index,
      };
    }),
    { onConflict: 'slug' },
  );

  if (courseError) {
    throw new Error(`Course sync failed: ${courseError.message}`);
  }

  const { data: bundleRows, error: bundleError } = await supabase
    .from('bundles')
    .upsert(
      BUNDLE_CATALOG.map((bundle, index) => {
        const detail = getBundleDetailBySlug(bundle.slug);

        return {
          legacy_id: bundle.id,
          slug: bundle.slug,
          title: bundle.title,
          subtitle: bundle.subtitle,
          image: bundle.image,
          bundle_price: bundle.bundlePrice,
          original_price: bundle.originalPrice,
          access_label: bundle.accessLabel,
          highlight: bundle.highlight,
          feature_metrics: bundle.featureMetrics,
          tag: bundle.tag ?? null,
          short_description: detail?.overview ?? '',
          support_text: detail?.support ?? null,
          detail_content: detail
            ? {
                overview: detail.overview,
                deliverables: detail.deliverables,
                audience: detail.audience,
                workflow: detail.workflow,
                faq: detail.faq,
                support: detail.support,
                facts: detail.facts,
              }
            : {},
          gallery: [bundle.image],
          is_published: true,
          is_featured: index < 2,
          sort_order: index,
        };
      }),
      { onConflict: 'slug' },
    )
    .select('id, slug');

  if (bundleError) {
    throw new Error(`Bundle sync failed: ${bundleError.message}`);
  }

  for (const bundle of BUNDLE_CATALOG) {
    const bundleRow = (bundleRows ?? []).find((entry) => entry.slug === bundle.slug);

    if (!bundleRow) {
      continue;
    }

    await supabase.from('bundle_items').delete().eq('bundle_id', bundleRow.id);

    const items = bundle.includedCourseSlugs.map((courseSlug, index) => ({
      bundle_id: bundleRow.id,
      course_slug: courseSlug,
      sort_order: index,
    }));

    if (items.length > 0) {
      const { error: itemError } = await supabase.from('bundle_items').insert(items);

      if (itemError) {
        throw new Error(`Bundle item sync failed: ${itemError.message}`);
      }
    }
  }

  const { error: productError } = await supabase.from('products').upsert(
    SHOP_CATALOG.map((product, index) => {
      const detail = getProductDetailBySlug(product.slug);

      return {
        legacy_id: product.id,
        slug: product.slug,
        title: product.title,
        type: product.type,
        image: product.image,
        price: product.price,
        description: product.description,
        format: product.format,
        access_label: product.accessLabel,
        feature_metrics: product.featureMetrics,
        tag: product.tag ?? null,
        short_description: detail?.overview ?? '',
        support_text: detail?.support ?? null,
        detail_content: detail
          ? {
              overview: detail.overview,
              deliverables: detail.deliverables,
              useCases: detail.useCases,
              audience: detail.audience,
              workflow: detail.workflow,
              faq: detail.faq,
              support: detail.support,
              facts: detail.facts,
            }
          : {},
        gallery: [product.image],
        is_published: true,
        is_featured: index < 2,
        sort_order: index,
      };
    }),
    { onConflict: 'slug' },
  );

  if (productError) {
    throw new Error(`Product sync failed: ${productError.message}`);
  }

  const { error: blogError } = await supabase.from('blog_posts').upsert(
    BLOG_POSTS.map((post, index) => ({
      legacy_id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      display_date: post.date,
      image: post.image,
      category: post.category,
      tags: post.tags,
      is_published: true,
      is_featured: index < 3,
      sort_order: index,
    })),
    { onConflict: 'slug' },
  );

  if (blogError) {
    throw new Error(`Blog sync failed: ${blogError.message}`);
  }

  const { error: settingError } = await supabase.from('site_settings').upsert(
    [
      {
        setting_key: 'homepage.hero',
        setting_value: {
          eyebrow: 'দেশি কোর্স',
          ctaLabel: 'সব কোর্স দেখুন',
        },
      },
      {
        setting_key: 'homepage.promos',
        setting_value: {
          featuredCourseSlugs: FEATURED_COURSES.map((course) => course.slug),
          featuredBundleSlugs: BUNDLE_CATALOG.slice(0, 2).map((bundle) => bundle.slug),
          featuredProductSlugs: SHOP_CATALOG.slice(0, 2).map((product) => product.slug),
        },
      },
    ],
    { onConflict: 'setting_key' },
  );

  if (settingError) {
    throw new Error(`Site settings sync failed: ${settingError.message}`);
  }

  await Promise.all([
    syncFaqEntries(),
    syncHomepageSections(),
    syncTestimonials(),
    syncDeliveryRules(),
  ]);

  return {
    courses: COURSE_CATALOG.length,
    bundles: BUNDLE_CATALOG.length,
    products: SHOP_CATALOG.length,
    blogPosts: BLOG_POSTS.length,
  };
}
