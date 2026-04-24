'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { syncLegacyContentToDatabase } from '@/lib/admin-content-sync';
import { requireAdmin } from '@/lib/admin-auth';
import { getRequestSecurityContext, blockIpAddress, blockUserAccess, forceReauthUser, unblockIpAddress, unblockUserAccess } from '@/lib/auth-security';
import { logAdminAction } from '@/lib/admin-audit';
import { enqueueDeliveryJobsForEntitlement, retryDeliveryJob, processPendingDeliveryJobs, revokeProvisionedAccess } from '@/lib/delivery';
import { grantManualAccessForItem, listPurchasableTitlesBySlug, revokeEntitlement } from '@/lib/entitlements';
import { sanitizeRichHtml } from '@/lib/html-sanitize';
import { listManagedCourses } from '@/lib/content-store';
import { createAdminClient } from '@/lib/supabase/admin';

function toText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNullableText(value: FormDataEntryValue | null) {
  const text = toText(value);
  return text || null;
}

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(toText(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: FormDataEntryValue | null) {
  return toText(value) === 'true' || toText(value) === 'on';
}

function toStringArray(value: FormDataEntryValue | null) {
  return toText(value)
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toCsvArray(value: FormDataEntryValue | null) {
  return toText(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toJsonValue(value: FormDataEntryValue | null) {
  const text = toText(value);
  return text ? JSON.parse(text) : {};
}

function revalidateContentPaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

async function getAdminContext() {
  const { adminEmail } = await requireAdmin();
  const headerStore = await headers();
  const ipAddress = getRequestSecurityContext(headerStore).ipAddress;

  return {
    adminEmail,
    ipAddress: ipAddress === 'unknown' ? null : ipAddress,
  };
}

export async function syncLegacyContentAction() {
  await requireAdmin();
  await syncLegacyContentToDatabase();
  revalidateContentPaths([
    '/',
    '/courses',
    '/bundles',
    '/templates',
    '/blog',
    '/admin',
  ]);
}

export async function upsertCourseAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const slug = toText(formData.get('slug'));

  await supabase.from('courses').upsert(
    {
      id: toNullableText(formData.get('id')) ?? undefined,
      slug,
      title: toText(formData.get('title')),
      category: toText(formData.get('category')),
      level: toText(formData.get('level')) || 'beginner',
      price: toNumber(formData.get('price')),
      original_price: toNumber(formData.get('original_price')),
      image: toText(formData.get('image')),
      instructor: toText(formData.get('instructor')),
      access_label: toText(formData.get('access_label')),
      tag: toText(formData.get('tag')),
      promo_tag: toNullableText(formData.get('promo_tag')),
      feature_metrics: toStringArray(formData.get('feature_metrics')),
      short_description: toText(formData.get('short_description')),
      detail_content: toJsonValue(formData.get('detail_content')),
      gallery: toStringArray(formData.get('gallery')),
      seo_title: toNullableText(formData.get('seo_title')),
      seo_description: toNullableText(formData.get('seo_description')),
      badge_label: toNullableText(formData.get('badge_label')),
      support_text: toNullableText(formData.get('support_text')),
      access_duration_days:
        toNullableText(formData.get('access_duration_days')) === null
          ? null
          : toNumber(formData.get('access_duration_days')),
      visibility: toText(formData.get('visibility')) || 'public',
      metadata: toJsonValue(formData.get('metadata')),
      is_published: toBoolean(formData.get('is_published')),
      is_featured: toBoolean(formData.get('is_featured')),
      sort_order: toNumber(formData.get('sort_order')),
    },
    { onConflict: 'slug' },
  );

  await logAdminAction({
    adminEmail,
    action: 'catalog.course.upsert',
    targetType: 'course',
    targetId: slug,
    summary: 'Created or updated a course',
    ipAddress,
  });

  revalidateContentPaths(['/', '/courses', `/courses/${slug}`, '/admin']);
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = toNullableText(formData.get('id'));
  const slug = toText(formData.get('slug'));

  if (id) {
    await supabase.from('courses').delete().eq('id', id);
  } else if (slug) {
    await supabase.from('courses').delete().eq('slug', slug);
  }

  revalidateContentPaths(['/', '/courses', `/courses/${slug}`, '/admin']);
}

export async function upsertBundleAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const slug = toText(formData.get('slug'));
  const payload = {
    id: toNullableText(formData.get('id')) ?? undefined,
    slug,
    title: toText(formData.get('title')),
    subtitle: toText(formData.get('subtitle')),
    image: toText(formData.get('image')),
    bundle_price: toNumber(formData.get('bundle_price')),
    original_price: toNumber(formData.get('original_price')),
    access_label: toText(formData.get('access_label')),
    highlight: toText(formData.get('highlight')),
    feature_metrics: toStringArray(formData.get('feature_metrics')),
    short_description: toText(formData.get('short_description')),
    detail_content: toJsonValue(formData.get('detail_content')),
    gallery: toStringArray(formData.get('gallery')),
    seo_title: toNullableText(formData.get('seo_title')),
    seo_description: toNullableText(formData.get('seo_description')),
    badge_label: toNullableText(formData.get('badge_label')),
    support_text: toNullableText(formData.get('support_text')),
    visibility: toText(formData.get('visibility')) || 'public',
    metadata: toJsonValue(formData.get('metadata')),
    tag: toNullableText(formData.get('tag')),
    is_published: toBoolean(formData.get('is_published')),
    is_featured: toBoolean(formData.get('is_featured')),
    sort_order: toNumber(formData.get('sort_order')),
  };

  const { data, error } = await supabase
    .from('bundles')
    .upsert(payload, { onConflict: 'slug' })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from('bundle_items').delete().eq('bundle_id', data.id);

  const includedCourseSlugs = toCsvArray(formData.get('included_course_slugs'));
  if (includedCourseSlugs.length > 0) {
    await supabase.from('bundle_items').insert(
      includedCourseSlugs.map((courseSlug, index) => ({
        bundle_id: data.id,
        course_slug: courseSlug,
        sort_order: index,
      })),
    );
  }

  await logAdminAction({
    adminEmail,
    action: 'catalog.bundle.upsert',
    targetType: 'bundle',
    targetId: slug,
    summary: 'Created or updated a bundle',
    ipAddress,
  });

  revalidateContentPaths(['/', '/bundles', `/bundles/${slug}`, '/admin']);
}

export async function deleteBundleAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = toNullableText(formData.get('id'));
  const slug = toText(formData.get('slug'));

  if (id) {
    await supabase.from('bundles').delete().eq('id', id);
  } else if (slug) {
    await supabase.from('bundles').delete().eq('slug', slug);
  }

  revalidateContentPaths(['/', '/bundles', `/bundles/${slug}`, '/admin']);
}

export async function upsertProductAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const slug = toText(formData.get('slug'));

  await supabase.from('products').upsert(
    {
      id: toNullableText(formData.get('id')) ?? undefined,
      slug,
      title: toText(formData.get('title')),
      type: toText(formData.get('type')),
      image: toText(formData.get('image')),
      price: toNumber(formData.get('price')),
      description: toText(formData.get('description')),
      format: toText(formData.get('format')),
      access_label: toText(formData.get('access_label')),
      feature_metrics: toStringArray(formData.get('feature_metrics')),
      short_description: toText(formData.get('short_description')),
      detail_content: toJsonValue(formData.get('detail_content')),
      gallery: toStringArray(formData.get('gallery')),
      seo_title: toNullableText(formData.get('seo_title')),
      seo_description: toNullableText(formData.get('seo_description')),
      badge_label: toNullableText(formData.get('badge_label')),
      support_text: toNullableText(formData.get('support_text')),
      access_duration_days:
        toNullableText(formData.get('access_duration_days')) === null
          ? null
          : toNumber(formData.get('access_duration_days')),
      visibility: toText(formData.get('visibility')) || 'public',
      metadata: toJsonValue(formData.get('metadata')),
      tag: toNullableText(formData.get('tag')),
      is_published: toBoolean(formData.get('is_published')),
      is_featured: toBoolean(formData.get('is_featured')),
      sort_order: toNumber(formData.get('sort_order')),
    },
    { onConflict: 'slug' },
  );

  await logAdminAction({
    adminEmail,
    action: 'catalog.product.upsert',
    targetType: 'product',
    targetId: slug,
    summary: 'Created or updated a product',
    ipAddress,
  });

  revalidateContentPaths(['/', '/templates', `/templates/${slug}`, '/admin']);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = toNullableText(formData.get('id'));
  const slug = toText(formData.get('slug'));

  if (id) {
    await supabase.from('products').delete().eq('id', id);
  } else if (slug) {
    await supabase.from('products').delete().eq('slug', slug);
  }

  revalidateContentPaths(['/', '/templates', `/templates/${slug}`, '/admin']);
}

export async function upsertBlogPostAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const slug = toText(formData.get('slug'));

  await supabase.from('blog_posts').upsert(
    {
      id: toNullableText(formData.get('id')) ?? undefined,
      slug,
      title: toText(formData.get('title')),
      excerpt: toText(formData.get('excerpt')),
      content: sanitizeRichHtml(toText(formData.get('content'))),
      author: toText(formData.get('author')),
      display_date: toText(formData.get('display_date')),
      published_at: toNullableText(formData.get('published_at')),
      image: toText(formData.get('image')),
      category: toText(formData.get('category')),
      tags: toCsvArray(formData.get('tags')),
      seo_title: toNullableText(formData.get('seo_title')),
      seo_description: toNullableText(formData.get('seo_description')),
      metadata: toJsonValue(formData.get('metadata')),
      is_published: toBoolean(formData.get('is_published')),
      is_featured: toBoolean(formData.get('is_featured')),
      sort_order: toNumber(formData.get('sort_order')),
    },
    { onConflict: 'slug' },
  );

  await logAdminAction({
    adminEmail,
    action: 'content.blog.upsert',
    targetType: 'blog_post',
    targetId: slug,
    summary: 'Created or updated a blog post',
    ipAddress,
  });

  revalidateContentPaths(['/', '/blog', `/blog/${slug}`, '/admin']);
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = toNullableText(formData.get('id'));
  const slug = toText(formData.get('slug'));

  if (id) {
    await supabase.from('blog_posts').delete().eq('id', id);
  } else if (slug) {
    await supabase.from('blog_posts').delete().eq('slug', slug);
  }

  revalidateContentPaths(['/', '/blog', `/blog/${slug}`, '/admin']);
}

export async function updateUserProfileAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const userId = toText(formData.get('user_id'));

  await supabase
    .from('profiles')
    .update({
      full_name: toText(formData.get('full_name')),
      phone: toNullableText(formData.get('phone')),
    })
    .eq('id', userId);

  revalidateContentPaths(['/dashboard', '/admin']);
}

export async function grantEnrollmentAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const userId = toText(formData.get('user_id'));
  const courseSlug = toText(formData.get('course_slug'));
  const courses = await listManagedCourses();
  const course = courses.find((entry) => entry.slug === courseSlug);

  await supabase.from('enrollments').upsert(
    {
      user_id: userId,
      course_slug: courseSlug,
      course_title: course?.title ?? courseSlug,
      enrollment_status: 'active',
      progress: 0,
    },
    { onConflict: 'user_id,course_slug' },
  );

  revalidateContentPaths(['/dashboard', '/admin']);
}

export async function revokeEnrollmentAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const enrollmentId = toText(formData.get('enrollment_id'));
  await supabase.from('enrollments').delete().eq('id', enrollmentId);
  revalidateContentPaths(['/dashboard', '/admin']);
}

export async function updateOrderAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const orderId = toText(formData.get('order_id'));
  const rawDeliveryLinks = toNullableText(formData.get('delivery_links_json'));
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('metadata')
    .eq('id', orderId)
    .single();
  const metadata =
    existingOrder?.metadata &&
    typeof existingOrder.metadata === 'object' &&
    !Array.isArray(existingOrder.metadata)
      ? { ...(existingOrder.metadata as Record<string, unknown>) }
      : {};

  if (rawDeliveryLinks) {
    metadata.deliveryLinks = toJsonValue(rawDeliveryLinks);
  }

  await supabase
    .from('orders')
    .update({
      payment_status: toText(formData.get('payment_status')),
      payment_url: toNullableText(formData.get('payment_url')),
      metadata,
    })
    .eq('id', orderId);

  revalidateContentPaths(['/dashboard', '/payments/success', '/admin']);
}

export async function upsertCouponAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const includeRules = toStringArray(formData.get('include_rules')).map((value) => {
    const [itemType, ...slugParts] = value.split(':');
    return {
      mode: 'include' as const,
      item_type: itemType,
      item_slug: slugParts.join(':'),
    };
  });
  const excludeRules = toStringArray(formData.get('exclude_rules')).map((value) => {
    const [itemType, ...slugParts] = value.split(':');
    return {
      mode: 'exclude' as const,
      item_type: itemType,
      item_slug: slugParts.join(':'),
    };
  });

  const { data, error } = await supabase.from('coupons').upsert(
    {
      id: toNullableText(formData.get('id')) ?? undefined,
      code: toText(formData.get('code')).toUpperCase(),
      description: toNullableText(formData.get('description')),
      discount_type: toText(formData.get('discount_type')) || 'fixed',
      discount_value: toNumber(formData.get('discount_value')),
      applies_to: toText(formData.get('applies_to')) || 'all',
      target_item_type: toNullableText(formData.get('target_item_type')),
      target_slug: toNullableText(formData.get('target_slug')),
      min_order_amount: toNumber(formData.get('min_order_amount')),
      max_discount_amount:
        toNullableText(formData.get('max_discount_amount')) === null
          ? null
          : toNumber(formData.get('max_discount_amount')),
      usage_limit:
        toNullableText(formData.get('usage_limit')) === null
          ? null
          : toNumber(formData.get('usage_limit')),
      per_user_limit:
        toNullableText(formData.get('per_user_limit')) === null
          ? null
          : toNumber(formData.get('per_user_limit')),
      single_use: toBoolean(formData.get('single_use')),
      starts_at: toNullableText(formData.get('starts_at')),
      expires_at: toNullableText(formData.get('expires_at')),
      is_active: toBoolean(formData.get('is_active')),
    },
    { onConflict: 'code' },
  )
  .select('id, code')
  .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from('coupon_item_rules').delete().eq('coupon_id', data.id);

  const allRules = [...includeRules, ...excludeRules].filter(
    (entry) => entry.item_type && entry.item_slug,
  );

  if (allRules.length > 0) {
    await supabase.from('coupon_item_rules').insert(
      allRules.map((entry) => ({
        coupon_id: data.id,
        mode: entry.mode,
        item_type: entry.item_type,
        item_slug: entry.item_slug,
      })),
    );
  }

  await logAdminAction({
    adminEmail,
    action: 'coupon.upsert',
    targetType: 'coupon',
    targetId: data.code,
    summary: 'Created or updated a coupon',
    ipAddress,
  });

  revalidateContentPaths(['/admin']);
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from('coupons')
    .update({ is_active: toBoolean(formData.get('is_active')) })
    .eq('id', toText(formData.get('id')));
  revalidateContentPaths(['/admin']);
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from('coupons').delete().eq('id', toText(formData.get('id')));
  revalidateContentPaths(['/admin']);
}

export async function upsertSiteSettingAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const key = toText(formData.get('setting_key'));

  await supabase.from('site_settings').upsert(
    {
      setting_key: key,
      setting_value: toJsonValue(formData.get('setting_value')),
    },
    { onConflict: 'setting_key' },
  );

  revalidateContentPaths(['/', '/admin']);
}

export async function createUserAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const fullName = toText(formData.get('full_name'));
  const email = toText(formData.get('email')).toLowerCase();
  const phone = toNullableText(formData.get('phone'));
  const password = toText(formData.get('password')) || `${crypto.randomUUID().slice(0, 8)}Aa!`;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'User create করা যায়নি।');
  }

  await supabase.from('profiles').upsert(
    {
      id: data.user.id,
      full_name: fullName,
      email,
      phone,
    },
    { onConflict: 'id' },
  );

  await logAdminAction({
    adminEmail,
    action: 'user.create',
    targetType: 'user',
    targetId: data.user.id,
    summary: 'Created a user account from admin',
    details: {
      email,
    },
    ipAddress,
  });

  revalidateContentPaths(['/admin', '/admin/users']);
}

export async function addUserAdminNoteAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const userId = toText(formData.get('user_id'));
  const note = toText(formData.get('note'));

  if (!note) {
    throw new Error('Note লিখতে হবে।');
  }

  await supabase.from('user_admin_notes').insert({
    user_id: userId,
    admin_email: adminEmail,
    note,
  });

  await supabase
    .from('profiles')
    .update({ admin_note_summary: note.slice(0, 280) })
    .eq('id', userId);

  await logAdminAction({
    adminEmail,
    action: 'user.note.add',
    targetType: 'user',
    targetId: userId,
    summary: 'Added an internal admin note',
    ipAddress,
  });

  revalidateContentPaths(['/admin', `/admin/users/${userId}`]);
}

export async function grantAccessAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const userId = toText(formData.get('user_id'));
  const itemRef = toText(formData.get('item_ref'));
  const parsedItemRef = itemRef
    ? (() => {
        const [type, ...slugParts] = itemRef.split(':');
        const slug = slugParts.join(':');
        return {
          type,
          slug,
        };
      })()
    : null;
  const itemType = ((parsedItemRef?.type || toText(formData.get('item_type'))) as 'course' | 'bundle' | 'shop');
  const itemSlug = parsedItemRef?.slug || toText(formData.get('item_slug'));
  const explicitTitle = toNullableText(formData.get('item_title'));
  const lookup = await listPurchasableTitlesBySlug();
  const titleLookup =
    itemType === 'course'
      ? lookup.courses
      : itemType === 'bundle'
        ? lookup.bundles
        : lookup.products;
  const title = explicitTitle ?? titleLookup.get(itemSlug) ?? itemSlug;
  const entitlements = await grantManualAccessForItem({
    userId,
    itemType,
    slug: itemSlug,
    title,
  });

  let deliveryError: string | null = null;

  try {
    await Promise.all(
      entitlements.map((entry) => enqueueDeliveryJobsForEntitlement(entry.id)),
    );
    await processPendingDeliveryJobs(10);
  } catch (error) {
    deliveryError =
      error instanceof Error ? error.message : 'Delivery queue failed to process';
  }

  await logAdminAction({
    adminEmail,
    action: 'entitlement.grant',
    targetType: 'user',
    targetId: userId,
    summary: 'Granted item access from admin',
    details: {
      itemType,
      itemSlug,
      entitlementIds: entitlements.map((entry) => entry.id),
      deliveryError,
    },
    ipAddress,
  });

  revalidateContentPaths(['/dashboard', '/admin', `/admin/users/${userId}`]);
}

export async function revokeAccessAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const entitlementId = toText(formData.get('entitlement_id'));
  const userId = toText(formData.get('user_id'));
  const reason = toNullableText(formData.get('reason')) ?? 'Revoked from admin panel';

  try {
    await revokeProvisionedAccess(entitlementId);
  } catch {
    // Ignore provider revoke failure here; entitlement revoke still proceeds and delivery logs capture it.
  }

  const entitlement = await revokeEntitlement({
    entitlementId,
    reason,
  });

  await logAdminAction({
    adminEmail,
    action: 'entitlement.revoke',
    targetType: 'entitlement',
    targetId: entitlementId,
    summary: 'Revoked user access from admin',
    details: {
      itemType: entitlement.item_type,
      itemSlug: entitlement.item_slug,
      userId: entitlement.user_id,
    },
    ipAddress,
  });

  revalidateContentPaths(['/dashboard', '/admin', `/admin/users/${userId}`]);
}

export async function blockUserAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const userId = toText(formData.get('user_id'));
  await blockUserAccess({
    userId,
    adminEmail,
    reason: toNullableText(formData.get('reason')),
    ipAddress,
  });
  revalidateContentPaths(['/admin', '/dashboard', `/admin/users/${userId}`]);
}

export async function unblockUserAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const userId = toText(formData.get('user_id'));
  await unblockUserAccess({
    userId,
    adminEmail,
    ipAddress,
  });
  revalidateContentPaths(['/admin', '/dashboard', `/admin/users/${userId}`]);
}

export async function forceReauthUserAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const userId = toText(formData.get('user_id'));
  await forceReauthUser({
    userId,
    adminEmail,
    ipAddress,
  });
  revalidateContentPaths(['/admin', '/dashboard', `/admin/users/${userId}`]);
}

export async function blockIpAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  await blockIpAddress({
    ipAddress: toText(formData.get('ip_address')),
    adminEmail,
    reason: toNullableText(formData.get('reason')),
    expiresAt: toNullableText(formData.get('expires_at')),
    requestIp: ipAddress,
  });
  revalidateContentPaths(['/admin/security']);
}

export async function unblockIpAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  await unblockIpAddress({
    ipAddress: toText(formData.get('ip_address')),
    adminEmail,
    requestIp: ipAddress,
  });
  revalidateContentPaths(['/admin/security']);
}

export async function retryDeliveryJobAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const jobId = toText(formData.get('job_id'));
  await retryDeliveryJob(jobId);
  await logAdminAction({
    adminEmail,
    action: 'delivery.retry',
    targetType: 'delivery_job',
    targetId: jobId,
    summary: 'Retried a delivery job',
    ipAddress,
  });
  revalidateContentPaths(['/admin', '/admin/delivery-jobs']);
}

export async function processDeliveryQueueAction() {
  const { adminEmail, ipAddress } = await getAdminContext();
  await processPendingDeliveryJobs(20);
  await logAdminAction({
    adminEmail,
    action: 'delivery.process_pending',
    targetType: 'delivery_queue',
    summary: 'Processed pending delivery jobs',
    ipAddress,
  });
  revalidateContentPaths(['/admin', '/admin/delivery-jobs']);
}

export async function upsertFaqAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const id = toNullableText(formData.get('id')) ?? undefined;
  await supabase.from('faq_entries').upsert(
    {
      id,
      scope: toText(formData.get('scope')) || 'site',
      scope_slug: toNullableText(formData.get('scope_slug')),
      question: toText(formData.get('question')),
      answer: toText(formData.get('answer')),
      sort_order: toNumber(formData.get('sort_order')),
      is_published: toBoolean(formData.get('is_published')),
    },
    { onConflict: 'id' },
  );
  await logAdminAction({
    adminEmail,
    action: 'content.faq.upsert',
    targetType: 'faq_entry',
    targetId: id ?? null,
    summary: 'Created or updated an FAQ entry',
    ipAddress,
  });
  revalidateContentPaths(['/faq', '/admin/content/faq', '/']);
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from('faq_entries').delete().eq('id', toText(formData.get('id')));
  revalidateContentPaths(['/faq', '/admin/content/faq', '/']);
}

export async function upsertHomepageSectionAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const sectionKey = toText(formData.get('section_key'));
  await supabase.from('homepage_sections').upsert(
    {
      id: toNullableText(formData.get('id')) ?? undefined,
      section_key: sectionKey,
      title: toNullableText(formData.get('title')),
      subtitle: toNullableText(formData.get('subtitle')),
      body: toJsonValue(formData.get('body')),
      is_published: toBoolean(formData.get('is_published')),
      sort_order: toNumber(formData.get('sort_order')),
    },
    { onConflict: 'section_key' },
  );
  await logAdminAction({
    adminEmail,
    action: 'content.homepage.upsert',
    targetType: 'homepage_section',
    targetId: sectionKey,
    summary: 'Created or updated a homepage section',
    ipAddress,
  });
  revalidateContentPaths(['/', '/admin/content/homepage']);
}

export async function upsertTestimonialAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  await supabase.from('testimonials').upsert(
    {
      id: toNullableText(formData.get('id')) ?? undefined,
      quote: toText(formData.get('quote')),
      name: toText(formData.get('name')),
      role: toText(formData.get('role')),
      avatar_url: toNullableText(formData.get('avatar_url')),
      rating: toNumber(formData.get('rating'), 5),
      is_published: toBoolean(formData.get('is_published')),
      sort_order: toNumber(formData.get('sort_order')),
    },
    { onConflict: 'id' },
  );
  await logAdminAction({
    adminEmail,
    action: 'content.testimonial.upsert',
    targetType: 'testimonial',
    summary: 'Created or updated a testimonial',
    ipAddress,
  });
  revalidateContentPaths(['/', '/admin/content/testimonials']);
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from('testimonials').delete().eq('id', toText(formData.get('id')));
  revalidateContentPaths(['/', '/admin/content/testimonials']);
}

export async function upsertAnnouncementBannerAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  await supabase.from('announcement_banners').upsert(
    {
      id: toNullableText(formData.get('id')) ?? undefined,
      title: toText(formData.get('title')),
      body: toText(formData.get('body')),
      cta_label: toNullableText(formData.get('cta_label')),
      cta_href: toNullableText(formData.get('cta_href')),
      theme: toText(formData.get('theme')) || 'brand',
      is_active: toBoolean(formData.get('is_active')),
      sort_order: toNumber(formData.get('sort_order')),
      starts_at: toNullableText(formData.get('starts_at')),
      ends_at: toNullableText(formData.get('ends_at')),
    },
    { onConflict: 'id' },
  );
  await logAdminAction({
    adminEmail,
    action: 'content.banner.upsert',
    targetType: 'announcement_banner',
    summary: 'Created or updated an announcement banner',
    ipAddress,
  });
  revalidateContentPaths(['/', '/admin/content/homepage']);
}

export async function deleteAnnouncementBannerAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from('announcement_banners').delete().eq('id', toText(formData.get('id')));
  revalidateContentPaths(['/', '/admin/content/homepage']);
}

export async function upsertDeliveryRuleAction(formData: FormData) {
  const { adminEmail, ipAddress } = await getAdminContext();
  const supabase = createAdminClient();
  const id = toNullableText(formData.get('id')) ?? undefined;
  const itemType = toText(formData.get('item_type'));
  const itemSlug = toText(formData.get('item_slug'));

  await supabase.from('delivery_rules').upsert(
    {
      id,
      item_type: itemType,
      item_slug: itemSlug,
      channel: toText(formData.get('channel')),
      position: toNumber(formData.get('position')),
      is_active: toBoolean(formData.get('is_active')),
      config: toJsonValue(formData.get('config')),
    },
    { onConflict: 'id' },
  );

  await logAdminAction({
    adminEmail,
    action: 'delivery.rule.upsert',
    targetType: 'delivery_rule',
    targetId: `${itemType}:${itemSlug}`,
    summary: 'Created or updated a delivery rule',
    ipAddress,
  });

  revalidateContentPaths(['/admin/catalog/courses', '/admin/catalog/bundles', '/admin/catalog/products']);
}

export async function deleteDeliveryRuleAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from('delivery_rules').delete().eq('id', toText(formData.get('id')));
  revalidateContentPaths(['/admin/catalog/courses', '/admin/catalog/bundles', '/admin/catalog/products']);
}
