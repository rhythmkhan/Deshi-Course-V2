import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBundleBySlug } from '@/lib/bundle-catalog';
import { getCourseCardBySlug } from '@/lib/course-details';
import { getShopBySlug } from '@/lib/shop-catalog';
import { listManagedBundles, listManagedCourses, listManagedProducts } from '@/lib/content-store';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingRelationError } from '@/lib/supabase/errors';

type ItemType = 'course' | 'bundle' | 'shop';

interface OrderRow {
  id: string;
  user_id: string;
  course_slug: string;
  payment_provider?: string | null;
}

interface OrderItemRow {
  item_type: ItemType;
  item_slug: string;
  item_title: string;
}

export interface PurchasedItem {
  itemType: ItemType;
  slug: string;
  title: string;
}

interface EntitlementRow {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_slug: string;
  item_title: string;
  order_id: string | null;
  source: string;
  source_ref: string | null;
  granted_via_type: ItemType | null;
  granted_via_slug: string | null;
  status: 'pending' | 'active' | 'revoked' | 'expired';
  delivery_state: string;
}

function decodeCartOrderItems(encodedValue: string) {
  if (!encodedValue.startsWith('cart:')) {
    return [];
  }

  return encodedValue
    .slice(5)
    .split('|')
    .map((entry) => {
      const [type, ...slugParts] = entry.split(':');
      const slug = slugParts.join(':');

      if (!type || !slug || !['course', 'bundle', 'shop'].includes(type)) {
        return null;
      }

      return {
        itemType: type as ItemType,
        slug,
      };
    })
    .filter((item): item is { itemType: ItemType; slug: string } => Boolean(item));
}

function resolveFallbackTitle(itemType: ItemType, slug: string) {
  if (itemType === 'course') {
    return getCourseCardBySlug(slug)?.title ?? slug;
  }

  if (itemType === 'bundle') {
    return getBundleBySlug(slug)?.title ?? slug;
  }

  return getShopBySlug(slug)?.title ?? slug;
}

export function resolvePurchasedItems(order: OrderRow, orderItems: OrderItemRow[]) {
  if (orderItems.length > 0) {
    return orderItems.map((item) => ({
      itemType: item.item_type,
      slug: item.item_slug,
      title: item.item_title || resolveFallbackTitle(item.item_type, item.item_slug),
    })) satisfies PurchasedItem[];
  }

  if (order.course_slug.startsWith('cart:')) {
    return decodeCartOrderItems(order.course_slug).map((item) => ({
      itemType: item.itemType,
      slug: item.slug,
      title: resolveFallbackTitle(item.itemType, item.slug),
    })) satisfies PurchasedItem[];
  }

  return [
    {
      itemType: 'course',
      slug: order.course_slug,
      title: resolveFallbackTitle('course', order.course_slug),
    },
  ] satisfies PurchasedItem[];
}

async function upsertEntitlement(params: {
  userId: string;
  orderId?: string | null;
  itemType: ItemType;
  slug: string;
  title: string;
  source: string;
  sourceRef?: string | null;
  grantedViaType?: ItemType | null;
  grantedViaSlug?: string | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_entitlements')
    .upsert(
      {
        user_id: params.userId,
        order_id: params.orderId ?? null,
        item_type: params.itemType,
        item_slug: params.slug,
        item_title: params.title,
        source: params.source,
        source_ref: params.sourceRef ?? null,
        granted_via_type: params.grantedViaType ?? null,
        granted_via_slug: params.grantedViaSlug ?? null,
        status: 'active',
        granted_at: new Date().toISOString(),
        revoked_at: null,
        revoked_reason: null,
      },
      { onConflict: 'user_id,item_type,item_slug' },
    )
    .select(
      'id, user_id, item_type, item_slug, item_title, order_id, source, source_ref, granted_via_type, granted_via_slug, status, delivery_state',
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as EntitlementRow;
}

async function removeEnrollmentIfNoActiveEntitlement(userId: string, courseSlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', 'course')
    .eq('item_slug', courseSlug)
    .in('status', ['pending', 'active'])
    .limit(1);

  if (error && !isMissingRelationError(error, 'user_entitlements')) {
    throw new Error(error.message);
  }

  if (((data as Array<{ id: string }> | null) ?? []).length === 0) {
    await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_slug', courseSlug);
  }
}

export async function syncCourseEnrollmentFromEntitlement(params: {
  userId: string;
  courseSlug: string;
  courseTitle: string;
  active: boolean;
}) {
  const supabase = createAdminClient();

  if (!params.active) {
    await removeEnrollmentIfNoActiveEntitlement(params.userId, params.courseSlug);
    return;
  }

  await supabase.from('enrollments').upsert(
    {
      user_id: params.userId,
      course_slug: params.courseSlug,
      course_title: params.courseTitle,
      enrollment_status: 'active',
      progress: 0,
    },
    { onConflict: 'user_id,course_slug' },
  );
}

async function buildBundleCourseMap() {
  const [managedBundles, managedCourses] = await Promise.all([
    listManagedBundles(),
    listManagedCourses(),
  ]);

  const courseTitleBySlug = new Map(
    managedCourses.map((course) => [course.slug, course.title]),
  );

  return {
    bundlesBySlug: new Map(
      managedBundles.map((bundle) => [bundle.slug, bundle]),
    ),
    courseTitleBySlug,
  };
}

export async function grantEntitlement(params: {
  userId: string;
  orderId?: string | null;
  itemType: ItemType;
  slug: string;
  title: string;
  source: string;
  sourceRef?: string | null;
  grantedViaType?: ItemType | null;
  grantedViaSlug?: string | null;
}) {
  const entitlement = await upsertEntitlement(params);

  if (params.itemType === 'course') {
    await syncCourseEnrollmentFromEntitlement({
      userId: params.userId,
      courseSlug: params.slug,
      courseTitle: params.title,
      active: true,
    });
  }

  return entitlement;
}

export async function grantManualAccessForItem(params: {
  userId: string;
  itemType: ItemType;
  slug: string;
  title: string;
  sourceRef?: string | null;
}) {
  const entitlement = await grantEntitlement({
    userId: params.userId,
    itemType: params.itemType,
    slug: params.slug,
    title: params.title,
    source: 'admin_manual',
    sourceRef: params.sourceRef ?? null,
  });

  if (params.itemType !== 'bundle') {
    return [entitlement];
  }

  const { bundlesBySlug, courseTitleBySlug } = await buildBundleCourseMap();
  const bundle = bundlesBySlug.get(params.slug) ?? getBundleBySlug(params.slug);
  const childEntitlements = [entitlement];

  for (const courseSlug of bundle?.includedCourseSlugs ?? []) {
    const courseTitle =
      courseTitleBySlug.get(courseSlug) ?? getCourseCardBySlug(courseSlug)?.title ?? courseSlug;

    childEntitlements.push(
      await grantEntitlement({
        userId: params.userId,
        itemType: 'course',
        slug: courseSlug,
        title: courseTitle,
        source: 'admin_manual',
        sourceRef: params.slug,
        grantedViaType: 'bundle',
        grantedViaSlug: params.slug,
      }),
    );
  }

  return childEntitlements;
}

export async function grantEntitlementsForOrder(orderId: string) {
  const supabase = createAdminClient();
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, course_slug, payment_provider')
    .eq('id', orderId)
    .single();

  if (orderError || !orderData) {
    throw new Error(orderError?.message ?? 'Order not found');
  }

  const { data: orderItemsData } = await supabase
    .from('order_items')
    .select('item_type, item_slug, item_title')
    .eq('order_id', orderId);

  const order = orderData as OrderRow;
  const orderItems = (orderItemsData as OrderItemRow[] | null) ?? [];
  const purchasedItems = resolvePurchasedItems(order, orderItems);
  const { bundlesBySlug, courseTitleBySlug } = await buildBundleCourseMap();
  const entitlements: EntitlementRow[] = [];

  for (const item of purchasedItems) {
    const source = order.payment_provider === 'free' ? 'free' : 'purchase';

    const entitlement = await grantEntitlement({
      userId: order.user_id,
      orderId: order.id,
      itemType: item.itemType,
      slug: item.slug,
      title: item.title,
      source,
    });

    entitlements.push(entitlement);

    if (item.itemType !== 'bundle') {
      continue;
    }

    const bundle = bundlesBySlug.get(item.slug);
    const includedCourseSlugs =
      bundle?.includedCourseSlugs ?? getBundleBySlug(item.slug)?.includedCourseSlugs ?? [];

    for (const courseSlug of includedCourseSlugs) {
      const courseTitle =
        courseTitleBySlug.get(courseSlug) ?? getCourseCardBySlug(courseSlug)?.title ?? courseSlug;

      entitlements.push(
        await grantEntitlement({
          userId: order.user_id,
          orderId: order.id,
          itemType: 'course',
          slug: courseSlug,
          title: courseTitle,
          source: 'bundle_grant',
          sourceRef: item.slug,
          grantedViaType: 'bundle',
          grantedViaSlug: item.slug,
        }),
      );
    }
  }

  return entitlements;
}

export async function revokeEntitlement(params: {
  entitlementId: string;
  reason?: string | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_entitlements')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_reason: params.reason ?? null,
    })
    .eq('id', params.entitlementId)
    .select(
      'id, user_id, item_type, item_slug, item_title, order_id, source, source_ref, granted_via_type, granted_via_slug, status, delivery_state',
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const entitlement = data as EntitlementRow;

  if (entitlement.item_type === 'bundle') {
    const bundleChildren = await supabase
      .from('user_entitlements')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_reason: params.reason ?? 'Revoked with parent bundle',
      })
      .eq('user_id', entitlement.user_id)
      .eq('granted_via_type', 'bundle')
      .eq('granted_via_slug', entitlement.item_slug)
      .in('status', ['pending', 'active'])
      .select('item_slug, item_type, item_title');

    if (!bundleChildren.error) {
      for (const row of ((bundleChildren.data as Array<{ item_slug: string; item_type: ItemType; item_title: string }> | null) ?? [])) {
        if (row.item_type === 'course') {
          await syncCourseEnrollmentFromEntitlement({
            userId: entitlement.user_id,
            courseSlug: row.item_slug,
            courseTitle: row.item_title,
            active: false,
          });
        }
      }
    }
  }

  if (entitlement.item_type === 'course') {
    await syncCourseEnrollmentFromEntitlement({
      userId: entitlement.user_id,
      courseSlug: entitlement.item_slug,
      courseTitle: entitlement.item_title,
      active: false,
    });
  }

  return entitlement;
}

export async function listUserEntitlements(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_entitlements')
    .select(
      'id, user_id, item_type, item_slug, item_title, order_id, source, source_ref, granted_via_type, granted_via_slug, status, delivery_state',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error && !isMissingRelationError(error, 'user_entitlements')) {
    throw new Error(error.message);
  }

  return (data as EntitlementRow[] | null) ?? [];
}

export async function checkEntitlementOwnership(
  supabase: SupabaseClient,
  userId: string,
  item: { type: ItemType; slug: string },
) {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', item.type)
    .eq('item_slug', item.slug)
    .in('status', ['pending', 'active'])
    .limit(1);

  if (error && !isMissingRelationError(error, 'user_entitlements')) {
    throw new Error(error.message);
  }

  return ((data as Array<{ id: string }> | null) ?? []).length > 0;
}

export async function listPurchasableTitlesBySlug() {
  const [courses, bundles, products] = await Promise.all([
    listManagedCourses(),
    listManagedBundles(),
    listManagedProducts(),
  ]);

  return {
    courses: new Map(courses.map((course) => [course.slug, course.title])),
    bundles: new Map(bundles.map((bundle) => [bundle.slug, bundle.title])),
    products: new Map(products.map((product) => [product.slug, product.title])),
  };
}
