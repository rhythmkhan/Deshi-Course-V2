import type { SupabaseClient } from '@supabase/supabase-js';
import { BUNDLE_CATALOG } from '@/lib/bundle-catalog';
import { COURSE_CATALOG } from '@/lib/course-catalog';
import { SHOP_CATALOG } from '@/lib/shop-catalog';
import { isMissingRelationError } from '@/lib/supabase/errors';

interface EnrollmentRow {
  course_slug: string;
}

interface EntitlementRow {
  id: string;
  item_type: 'course' | 'bundle' | 'shop';
  item_slug: string;
  item_title: string;
  order_id: string | null;
  granted_at: string | null;
}

interface OrderRow {
  id: string;
  course_slug: string;
  created_at: string | null;
}

interface OrderItemRow {
  order_id: string;
  item_type: 'course' | 'bundle' | 'shop';
  item_slug: string;
  item_title?: string | null;
}

export interface PurchaseDetailItem {
  type: 'course' | 'bundle' | 'shop';
  slug: string;
  title: string;
}

export interface PurchaseDetails {
  orderId: string;
  purchasedAt: string | null;
  items: PurchaseDetailItem[];
  accessHref?: string | null;
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
        type: type as OrderItemRow['item_type'],
        slug,
      };
    })
    .filter((item): item is { type: OrderItemRow['item_type']; slug: string } => Boolean(item));
}

async function loadPaidOrders(supabase: SupabaseClient, userId: string) {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, course_slug, created_at')
    .eq('user_id', userId)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false });

  const safeOrders = ((orders as OrderRow[] | null) ?? []);
  const orderIds = safeOrders.map((order) => order.id);

  if (orderIds.length === 0) {
    return {
      orders: safeOrders,
      orderItems: [] as OrderItemRow[],
    };
  }

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('order_id, item_type, item_slug, item_title')
    .in('order_id', orderIds);

  return {
    orders: safeOrders,
    orderItems: ((orderItems as OrderItemRow[] | null) ?? []),
  };
}

async function loadActiveEntitlements(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('id, item_type, item_slug, item_title, order_id, granted_at')
    .eq('user_id', userId)
    .in('status', ['pending', 'active'])
    .order('granted_at', { ascending: false });

  if (error) {
    if (isMissingRelationError(error, 'user_entitlements')) {
      return [] as EntitlementRow[];
    }

    throw error;
  }

  return (data as EntitlementRow[] | null) ?? [];
}

function resolveCatalogTitle(item: { type: 'course' | 'bundle' | 'shop'; slug: string }) {
  if (item.type === 'course') {
    return (
      COURSE_CATALOG.find((entry) => entry.slug === item.slug)?.title ??
      item.slug
    );
  }

  if (item.type === 'bundle') {
    return (
      BUNDLE_CATALOG.find((entry) => entry.slug === item.slug)?.title ??
      item.slug
    );
  }

  return (
    SHOP_CATALOG.find((entry) => entry.slug === item.slug)?.title ??
    item.slug
  );
}

function buildOrderItems(order: OrderRow, orderItems: OrderItemRow[]) {
  const matchedOrderItems = orderItems.filter((item) => item.order_id === order.id);

  if (matchedOrderItems.length > 0) {
    return matchedOrderItems.map((item) => ({
      type: item.item_type,
      slug: item.item_slug,
      title: item.item_title || resolveCatalogTitle({ type: item.item_type, slug: item.item_slug }),
    })) satisfies PurchaseDetailItem[];
  }

  if (order.course_slug.startsWith('cart:')) {
    return decodeCartOrderItems(order.course_slug).map((item) => ({
      type: item.type,
      slug: item.slug,
      title: resolveCatalogTitle({ type: item.type, slug: item.slug }),
    })) satisfies PurchaseDetailItem[];
  }

  return [
    {
      type: 'course',
      slug: order.course_slug,
      title: resolveCatalogTitle({ type: 'course', slug: order.course_slug }),
    },
  ] satisfies PurchaseDetailItem[];
}

function buildPurchaseDetails(order: OrderRow, orderItems: OrderItemRow[]) {
  return {
    orderId: order.id,
    purchasedAt: order.created_at,
    items: buildOrderItems(order, orderItems),
  } satisfies PurchaseDetails;
}

export async function checkCourseOwnership(
  supabase: SupabaseClient,
  userId: string,
  courseSlug: string,
) {
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_slug')
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
    .in('enrollment_status', ['active', 'completed', 'pending'])
    .limit(1);

  if (((enrollments as EnrollmentRow[] | null) ?? []).length > 0) {
    return true;
  }

  const entitlements = await loadActiveEntitlements(supabase, userId);
  if (
    entitlements.some(
      (entry) => entry.item_type === 'course' && entry.item_slug === courseSlug,
    )
  ) {
    return true;
  }

  const { orders, orderItems } = await loadPaidOrders(supabase, userId);

  for (const item of orderItems) {
    if (item.item_type === 'course' && item.item_slug === courseSlug) {
      return true;
    }

    if (item.item_type === 'bundle') {
      const bundle = BUNDLE_CATALOG.find((entry) => entry.slug === item.item_slug);

      if (bundle?.includedCourseSlugs.includes(courseSlug)) {
        return true;
      }
    }
  }

  for (const order of orders) {
    if (order.course_slug === courseSlug) {
      return true;
    }

    for (const item of decodeCartOrderItems(order.course_slug)) {
      if (item.type === 'course' && item.slug === courseSlug) {
        return true;
      }

      if (item.type === 'bundle') {
        const bundle = BUNDLE_CATALOG.find((entry) => entry.slug === item.slug);

        if (bundle?.includedCourseSlugs.includes(courseSlug)) {
          return true;
        }
      }
    }
  }

  return false;
}

export async function getCoursePurchaseDetails(
  supabase: SupabaseClient,
  userId: string,
  courseSlug: string,
) {
  const entitlements = await loadActiveEntitlements(supabase, userId);
  const entitlement = entitlements.find(
    (entry) => entry.item_type === 'course' && entry.item_slug === courseSlug,
  );

  if (entitlement) {
    if (entitlement.order_id) {
      const { orders, orderItems } = await loadPaidOrders(supabase, userId);
      const matchedOrder = orders.find((order) => order.id === entitlement.order_id);

      if (matchedOrder) {
        return {
          ...buildPurchaseDetails(matchedOrder, orderItems),
        } satisfies PurchaseDetails;
      }
    }

    return {
      orderId: entitlement.order_id ?? `manual-${entitlement.id.slice(0, 8)}`,
      purchasedAt: entitlement.granted_at,
      items: [
        {
          type: 'course',
          slug: entitlement.item_slug,
          title:
            entitlement.item_title ||
            resolveCatalogTitle({ type: 'course', slug: entitlement.item_slug }),
        },
      ],
    } satisfies PurchaseDetails;
  }

  const { orders, orderItems } = await loadPaidOrders(supabase, userId);

  for (const order of orders) {
    const matchedOrderItems = orderItems.filter((item) => item.order_id === order.id);

    if (matchedOrderItems.some((item) => item.item_type === 'course' && item.item_slug === courseSlug)) {
      return {
        ...buildPurchaseDetails(order, orderItems),
      } satisfies PurchaseDetails;
    }

    if (
      matchedOrderItems.some((item) => {
        if (item.item_type !== 'bundle') {
          return false;
        }

        const bundle = BUNDLE_CATALOG.find((entry) => entry.slug === item.item_slug);
        return Boolean(bundle?.includedCourseSlugs.includes(courseSlug));
      })
    ) {
      return {
        ...buildPurchaseDetails(order, orderItems),
      } satisfies PurchaseDetails;
    }

    if (order.course_slug === courseSlug) {
      return {
        ...buildPurchaseDetails(order, orderItems),
      } satisfies PurchaseDetails;
    }

    const decodedItems = decodeCartOrderItems(order.course_slug);

    for (const item of decodedItems) {
      if (item.type === 'course' && item.slug === courseSlug) {
        return {
          ...buildPurchaseDetails(order, orderItems),
        } satisfies PurchaseDetails;
      }

      if (item.type === 'bundle') {
        const bundle = BUNDLE_CATALOG.find((entry) => entry.slug === item.slug);

        if (bundle?.includedCourseSlugs.includes(courseSlug)) {
          return {
            ...buildPurchaseDetails(order, orderItems),
          } satisfies PurchaseDetails;
        }
      }
    }
  }

  return null;
}

export async function checkItemPurchase(
  supabase: SupabaseClient,
  userId: string,
  item: { type: 'bundle' | 'shop'; slug: string },
) {
  const entitlements = await loadActiveEntitlements(supabase, userId);
  if (
    entitlements.some(
      (entry) => entry.item_type === item.type && entry.item_slug === item.slug,
    )
  ) {
    return true;
  }

  const { orders, orderItems } = await loadPaidOrders(supabase, userId);

  for (const orderItem of orderItems) {
    if (orderItem.item_type === item.type && orderItem.item_slug === item.slug) {
      return true;
    }
  }

  for (const order of orders) {
    for (const decodedItem of decodeCartOrderItems(order.course_slug)) {
      if (decodedItem.type === item.type && decodedItem.slug === item.slug) {
        return true;
      }
    }
  }

  return false;
}

export async function getItemPurchaseDetails(
  supabase: SupabaseClient,
  userId: string,
  item: { type: 'bundle' | 'shop'; slug: string },
) {
  const entitlements = await loadActiveEntitlements(supabase, userId);
  const entitlement = entitlements.find(
    (entry) => entry.item_type === item.type && entry.item_slug === item.slug,
  );

  if (entitlement) {
    if (entitlement.order_id) {
      const { orders, orderItems } = await loadPaidOrders(supabase, userId);
      const matchedOrder = orders.find((order) => order.id === entitlement.order_id);

      if (matchedOrder) {
        return buildPurchaseDetails(matchedOrder, orderItems);
      }
    }

    return {
      orderId: entitlement.order_id ?? `manual-${entitlement.id.slice(0, 8)}`,
      purchasedAt: entitlement.granted_at,
      items: [
        {
          type: item.type,
          slug: entitlement.item_slug,
          title:
            entitlement.item_title ||
            resolveCatalogTitle({ type: item.type, slug: entitlement.item_slug }),
        },
      ],
    } satisfies PurchaseDetails;
  }

  const { orders, orderItems } = await loadPaidOrders(supabase, userId);

  for (const order of orders) {
    const matchedOrderItems = orderItems.filter((entry) => entry.order_id === order.id);

    if (matchedOrderItems.some((entry) => entry.item_type === item.type && entry.item_slug === item.slug)) {
      return buildPurchaseDetails(order, orderItems);
    }

    const decodedItems = decodeCartOrderItems(order.course_slug);

    if (decodedItems.some((entry) => entry.type === item.type && entry.slug === item.slug)) {
      return buildPurchaseDetails(order, orderItems);
    }
  }

  return null;
}
