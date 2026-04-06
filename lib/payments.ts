import { getBundleBySlug } from '@/lib/bundle-catalog';
import { getCartPricingPreview, resolveCartItems, type CartCatalogItem, type CartItemInput } from '@/lib/cart';
import {
  redeemCouponForOrder,
  resolveCouponForCheckout,
  type CouponPricingRule,
} from '@/lib/coupons';
import { getCourseCardBySlug } from '@/lib/course-details';
import { sendAdminOrderLifecycleEmail, sendOrderConfirmationEmails } from '@/lib/email';
import { appendSuccessfulOrderRow } from '@/lib/google-sheets';
import { buildMetaContentType } from '@/lib/meta';
import { sendMetaConversionEvent } from '@/lib/meta-server';
import {
  ensureTelegramDeliveryLinks,
  getDeliverySheetValues,
  type DeliveryItem,
} from '@/lib/order-delivery';
import { getPricingPreview } from '@/lib/referral';
import { SITE_URL } from '@/lib/site-url';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  extractZiniPayInvoiceId,
  extractZiniPayTransactionId,
  extractZiniPayValId,
  isZiniPayCompleted,
  verifyZiniPayPayment,
} from '@/lib/zinipay';
import type { User } from '@supabase/supabase-js';

interface OrderRow {
  id: string;
  user_id: string;
  course_slug: string;
  payment_status: string;
  amount?: number | string | null;
  final_amount?: number | string | null;
  original_amount?: number | string | null;
  currency?: string | null;
  wallet_discount_amount?: number | string | null;
  referral_discount_amount?: number | string | null;
  coupon_code?: string | null;
  coupon_discount_amount?: number | string | null;
  provider_invoice_id?: string | null;
  provider_val_id?: string | null;
  provider_transaction_id?: string | null;
  payment_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  paid_at?: string | null;
}

interface OrderItemRow {
  item_type: 'course' | 'bundle' | 'shop';
  item_slug: string;
  item_title: string;
  unit_price: number | string;
  original_price?: number | string | null;
}

interface CheckoutProfile {
  wallet_balance?: number | string | null;
  welcome_discount_uses_remaining?: number | string | null;
}

interface ProfileRow {
  wallet_balance?: number | string | null;
  welcome_discount_uses_remaining?: number | string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface PurchaseTrackingItem {
  itemType: 'course' | 'bundle' | 'shop';
  slug: string;
  title: string;
  price: number;
}

interface AdminPendingOrderNotificationInput {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentUrl: string;
  items: Array<{
    title: string;
    type: 'course' | 'bundle' | 'shop';
    price: number;
  }>;
}

function encodeCartOrderItems(items: CartCatalogItem[]) {
  return `cart:${items.map((item) => `${item.type}:${item.slug}`).join('|')}`;
}

function decodeCartOrderItems(encodedValue: string): CartItemInput[] {
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
        type: type as CartItemInput['type'],
        slug,
      };
    })
    .filter((item): item is CartItemInput => Boolean(item));
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function getOrderMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
}

function buildPurchaseTrackingDetails(order: OrderRow, orderItems: OrderItemRow[]) {
  const fallbackCartItems = resolveCartItems(decodeCartOrderItems(order.course_slug));
  const primaryCourseSlug =
    orderItems.find((item) => item.item_type === 'course')?.item_slug ||
    fallbackCartItems.find((item) => item.type === 'course')?.slug ||
    (order.course_slug.startsWith('cart:') ? '' : order.course_slug);

  const trackedItems: PurchaseTrackingItem[] =
    orderItems.length > 0
      ? orderItems.map((item) => ({
          itemType: item.item_type,
          slug: item.item_slug,
          title: item.item_title,
          price: toNumber(item.unit_price),
        }))
      : fallbackCartItems.map((item) => ({
          itemType: item.type,
          slug: item.slug,
          title: item.title,
          price: item.price,
        }));

  if (!trackedItems.length && primaryCourseSlug) {
    const fallbackCourse = getCourseCardBySlug(primaryCourseSlug);

    if (fallbackCourse) {
      trackedItems.push({
        itemType: 'course',
        slug: fallbackCourse.slug,
        title: fallbackCourse.title,
        price: fallbackCourse.price,
      });
    }
  }

  const purchaseValue = toNumber(order.final_amount ?? order.amount);
  const resolvedValue =
    purchaseValue > 0
      ? purchaseValue
      : trackedItems.reduce((total, item) => total + item.price, 0);

  return {
    primaryCourseSlug,
    trackedItems,
    purchaseEventId: `purchase_${order.id}`,
    purchasePath: `/payments/success?orderId=${order.id}`,
    purchaseCustomData: {
      currency: order.currency || 'BDT',
      value: resolvedValue,
      content_name:
        trackedItems.length === 1 ? trackedItems[0]?.title : 'Deshi Course checkout',
      content_type:
        trackedItems.length === 1
          ? buildMetaContentType(trackedItems[0]?.itemType ?? 'course')
          : buildMetaContentType('cart', trackedItems.length),
      content_ids: trackedItems.map((item) => item.slug),
      contents: trackedItems.map((item) => ({
        id: item.slug,
        quantity: 1,
        item_price: item.price,
      })),
      num_items: trackedItems.length || 1,
    },
  };
}

function getCustomerName(user: User) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    'Deshi Course User'
  );
}

function getCustomerEmail(user: User) {
  return user.email || '';
}

function buildOrderMetadata(base: Record<string, unknown>): Record<string, unknown> {
  return {
    ...base,
    emailFlags: {
      ...(base.emailFlags && typeof base.emailFlags === 'object'
        ? (base.emailFlags as Record<string, unknown>)
        : {}),
    },
    metaFlags: {
      ...(base.metaFlags && typeof base.metaFlags === 'object'
        ? (base.metaFlags as Record<string, unknown>)
        : {}),
    },
  };
}

function buildOrderSource(order: OrderRow, orderItems: OrderItemRow[], metadata: Record<string, unknown>) {
  if (typeof metadata.checkoutSource === 'string' && metadata.checkoutSource) {
    const purchasedItems = Array.isArray(metadata.purchasedItems)
      ? metadata.purchasedItems.filter(
          (entry): entry is string => typeof entry === 'string' && entry.length > 0,
        )
      : [];

    return purchasedItems.length > 0
      ? `${metadata.checkoutSource}:${purchasedItems.join('|')}`
      : metadata.checkoutSource;
  }

  if (orderItems.length > 0) {
    return `cart:${orderItems
      .map((item) => `${item.item_type}:${item.item_slug}`)
      .join('|')}`;
  }

  return order.course_slug.startsWith('cart:')
    ? order.course_slug
    : `course:${order.course_slug}`;
}

function buildDeliveryItems(order: OrderRow, orderItems: OrderItemRow[]): DeliveryItem[] {
  if (orderItems.length > 0) {
    return orderItems.map((item) => ({
      itemType: item.item_type,
      slug: item.item_slug,
      title: item.item_title,
    }));
  }

  const fallbackCartItems = resolveCartItems(decodeCartOrderItems(order.course_slug));

  if (fallbackCartItems.length > 0) {
    return fallbackCartItems.map((item) => ({
      itemType: item.type,
      slug: item.slug,
      title: item.title,
    }));
  }

  const fallbackCourse = getCourseCardBySlug(order.course_slug);

  if (!fallbackCourse) {
    return [];
  }

  return [
    {
      itemType: 'course',
      slug: fallbackCourse.slug,
      title: fallbackCourse.title,
    },
  ];
}

function buildEnrollmentCourses(order: OrderRow, orderItems: OrderItemRow[]) {
  const cartSourceItems =
    orderItems.length > 0
      ? orderItems.map((item) => ({ type: item.item_type, slug: item.item_slug }))
      : decodeCartOrderItems(order.course_slug);

  if (cartSourceItems.length > 0) {
    return Array.from(
      new Map(
        cartSourceItems
          .flatMap((item) => {
            if (item.type === 'course') {
              const course = getCourseCardBySlug(item.slug);
              return course ? [[course.slug, course] as const] : [];
            }

            if (item.type === 'bundle') {
              const bundle = getBundleBySlug(item.slug);

              return (bundle?.includedCourseSlugs ?? [])
                .map((courseSlug) => getCourseCardBySlug(courseSlug))
                .filter((course): course is NonNullable<typeof course> => Boolean(course))
                .map((course) => [course.slug, course] as const);
            }

            return [];
          }),
      ).values(),
    );
  }

  return [getCourseCardBySlug(order.course_slug)].filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
}

export async function notifyAdminPendingOrderCreated({
  orderId,
  customerName,
  customerEmail,
  total,
  paymentUrl,
  items,
}: AdminPendingOrderNotificationInput) {
  await sendAdminOrderLifecycleEmail({
    status: 'created',
    orderId,
    buyerName: customerName,
    buyerEmail: customerEmail,
    total,
    paymentUrl,
    items,
  });
}

async function getAuthenticatedUserWithProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance, welcome_discount_uses_remaining')
    .eq('id', user.id)
    .single();

  return {
    supabase,
    user,
    profile: (profile as CheckoutProfile | null) ?? null,
  };
}

async function getCheckoutCoupon(params: {
  couponCode?: string;
  items: Array<{ type: 'course' | 'bundle' | 'shop'; slug: string; effectivePrice: number }>;
  referralDiscount: number;
  userId: string;
}) {
  if (!params.couponCode) {
    return null;
  }

  const couponResult = await resolveCouponForCheckout({
    code: params.couponCode,
    pricedItems: params.items,
    referralDiscount: params.referralDiscount,
    userId: params.userId,
  });

  if (!couponResult.coupon) {
    throw new Error(couponResult.error || 'Coupon apply করা যায়নি।');
  }

  return couponResult.coupon;
}

async function redeemSingleUseCouponForOrder(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  orderId: string;
  coupon: CouponPricingRule | null;
}) {
  if (!params.coupon?.singleUse) {
    return;
  }

  try {
    await redeemCouponForOrder({
      code: params.coupon.code,
      orderId: params.orderId,
    });
  } catch (error) {
    await params.supabase.from('orders').delete().eq('id', params.orderId);
    throw new Error(error instanceof Error ? error.message : 'Coupon redeem failed');
  }
}

function buildCouponSnapshot(coupon: CouponPricingRule | null, couponDiscount: number) {
  if (!coupon || couponDiscount <= 0) {
    return null;
  }

  return {
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    appliesTo: coupon.appliesTo,
    singleUse: coupon.singleUse,
    targetItemType: coupon.targetItemType,
    targetSlug: coupon.targetSlug,
    productSource: coupon.productSource,
    expiresAt: coupon.expiresAt,
    maxDiscountAmount: coupon.maxDiscountAmount,
    discountAmount: couponDiscount,
  };
}

export async function createPendingOrder(courseSlug: string, couponCode?: string) {
  const { supabase, user, profile } = await getAuthenticatedUserWithProfile();

  const course = getCourseCardBySlug(courseSlug);

  if (!course) {
    throw new Error('Course not found');
  }

  const basePricing = getPricingPreview(
    course.price,
    Number(profile?.wallet_balance ?? 0),
    Number(profile?.welcome_discount_uses_remaining ?? 0),
  );
  const coupon = await getCheckoutCoupon({
    couponCode,
    items: [{ type: 'course', slug: course.slug, effectivePrice: course.price }],
    referralDiscount: basePricing.referralDiscount,
    userId: user.id,
  });
  const pricing = getPricingPreview(
    course.price,
    Number(profile?.wallet_balance ?? 0),
    Number(profile?.welcome_discount_uses_remaining ?? 0),
    coupon,
  );

  const orderId = crypto.randomUUID();
  const { error } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user.id,
    course_slug: course.slug,
    amount: pricing.finalPrice,
    original_amount: pricing.listPrice,
    referral_discount_amount: pricing.referralDiscount,
    coupon_code: pricing.appliedCoupon?.code ?? null,
    coupon_discount_amount: pricing.couponDiscount,
    coupon_snapshot: buildCouponSnapshot(coupon, pricing.couponDiscount),
    wallet_discount_amount: pricing.walletDiscount,
    final_amount: pricing.finalPrice,
    currency: 'BDT',
    payment_status: 'pending',
    payment_provider: 'zinipay',
    metadata: {
      checkoutSource: 'course',
      purchasedItems: [`course:${course.slug}`],
      coupon: buildCouponSnapshot(coupon, pricing.couponDiscount),
    },
  });

  if (error) {
    throw new Error('Could not create order');
  }

  await redeemSingleUseCouponForOrder({
    supabase,
    orderId,
    coupon,
  });

  return {
    orderId,
    user,
    course,
    pricing,
    customerName: getCustomerName(user),
    customerEmail: getCustomerEmail(user),
  };
}

export async function createFreeCourseEnrollment(courseSlug: string) {
  const { supabase, user } = await getAuthenticatedUserWithProfile();

  const course = getCourseCardBySlug(courseSlug);

  if (!course) {
    throw new Error('Course not found');
  }

  if (course.price !== 0) {
    throw new Error('এই courseটি free নয়।');
  }

  const existingOwnership = await supabase
    .from('enrollments')
    .select('course_slug')
    .eq('user_id', user.id)
    .eq('course_slug', course.slug)
    .in('enrollment_status', ['active', 'completed', 'pending'])
    .limit(1);

  if (((existingOwnership.data as Array<{ course_slug: string }> | null) ?? []).length > 0) {
    return { alreadyOwned: true };
  }

  const orderId = crypto.randomUUID();
  const orderMetadata = {
    checkoutSource: 'free-course',
    purchasedItems: [`course:${course.slug}`],
  };
  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user.id,
    course_slug: course.slug,
    amount: 0,
    original_amount: 0,
    referral_discount_amount: 0,
    coupon_code: null,
    coupon_discount_amount: 0,
    wallet_discount_amount: 0,
    final_amount: 0,
    currency: 'BDT',
    payment_status: 'paid',
    payment_provider: 'free',
    paid_at: new Date().toISOString(),
    metadata: orderMetadata,
  });

  if (orderError) {
    throw new Error('Free enrollment order create করা যায়নি।');
  }

  const { error: enrollmentError } = await supabase.from('enrollments').upsert(
    {
      user_id: user.id,
      course_slug: course.slug,
      course_title: course.title,
      enrollment_status: 'active',
      progress: 0,
    },
    { onConflict: 'user_id,course_slug' },
  );

  if (enrollmentError) {
    throw new Error('Course enrollment create করা যায়নি।');
  }

  const deliveryResult = await ensureTelegramDeliveryLinks({
    orderId,
    items: [
      {
        itemType: 'course',
        slug: course.slug,
        title: course.title,
      },
    ],
    metadata: orderMetadata,
  });

  if (deliveryResult.errors.length > 0) {
    console.error('Free course delivery link prepare failed', deliveryResult.errors.join(' | '));
  }

  let nextMetadata = buildOrderMetadata(deliveryResult.metadata);
  let metadataDirty = deliveryResult.changed;
  const emailFlags = nextMetadata.emailFlags as Record<string, unknown>;

  if (user.email && emailFlags.success !== true) {
    try {
      await sendOrderConfirmationEmails({
        to: user.email,
        fullName: getCustomerName(user),
        orderId,
        items: [
          {
            title: course.title,
            type: 'course',
            price: 0,
          },
        ],
        total: 0,
        courseUrl: `${SITE_URL}/courses/${course.slug}`,
        deliveryLinks: deliveryResult.links.map((link) => ({
          label: link.label,
          url: link.url,
        })),
        status: 'free-enrollment',
      });

      nextMetadata = {
        ...nextMetadata,
        emailFlags: {
          ...emailFlags,
          success: true,
        },
        successEmailSentAt: Date.now(),
      };
      metadataDirty = true;
    } catch (error) {
      console.error('Free enrollment email failed', error);
    }
  }

  if (metadataDirty) {
    await supabase
      .from('orders')
      .update({ metadata: nextMetadata })
      .eq('id', orderId);
  }

  return { alreadyOwned: false };
}

function buildCartOrderSlug(items: CartCatalogItem[]) {
  return encodeCartOrderItems(items);
}

export async function createPendingCartOrder(items: CartItemInput[], couponCode?: string) {
  const { supabase, user, profile } = await getAuthenticatedUserWithProfile();

  const checkoutItems = resolveCartItems(items);

  if (!checkoutItems.length) {
    throw new Error('কার্টে valid item পাওয়া যায়নি।');
  }

  const basePricing = getCartPricingPreview(
    checkoutItems,
    Number(profile?.wallet_balance ?? 0),
    Number(profile?.welcome_discount_uses_remaining ?? 0),
  );
  const coupon = await getCheckoutCoupon({
    couponCode,
    items: basePricing.pricedItems.map((item) => ({
      type: item.type,
      slug: item.slug,
      effectivePrice: item.effectivePrice,
    })),
    referralDiscount: basePricing.referralDiscount,
    userId: user.id,
  });
  const pricing = getCartPricingPreview(
    checkoutItems,
    Number(profile?.wallet_balance ?? 0),
    Number(profile?.welcome_discount_uses_remaining ?? 0),
    coupon,
  );

  const orderId = crypto.randomUUID();
  const { error } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user.id,
    course_slug: buildCartOrderSlug(checkoutItems),
    amount: pricing.finalPrice,
    original_amount: pricing.originalSubtotal,
    referral_discount_amount: pricing.referralDiscount,
    coupon_code: pricing.appliedCoupon?.code ?? null,
    coupon_discount_amount: pricing.couponDiscount,
    coupon_snapshot: buildCouponSnapshot(coupon, pricing.couponDiscount),
    wallet_discount_amount: pricing.walletDiscount,
    final_amount: pricing.finalPrice,
    currency: 'BDT',
    payment_status: 'pending',
    payment_provider: 'zinipay',
    metadata: {
      checkoutSource: 'cart',
      purchasedItems: checkoutItems.map((item) => `${item.type}:${item.slug}`),
      coupon: buildCouponSnapshot(coupon, pricing.couponDiscount),
    },
  });

  if (error) {
    throw new Error('Could not create cart order');
  }

  const { error: orderItemsError } = await supabase.from('order_items').insert(
    pricing.pricedItems.map((item) => ({
      order_id: orderId,
      item_type: item.type,
      item_slug: item.slug,
      item_title: item.title,
      unit_price: item.effectivePrice,
      original_price: item.originalPrice,
      quantity: 1,
    })),
  );

  if (orderItemsError) {
    await supabase.from('orders').delete().eq('id', orderId);
    throw new Error('Could not create cart order items');
  }

  await redeemSingleUseCouponForOrder({
    supabase,
    orderId,
    coupon,
  });

  return {
    orderId,
    user,
    items: checkoutItems,
    pricing,
    customerName: getCustomerName(user),
    customerEmail: getCustomerEmail(user),
  };
}

export async function attachOrderPaymentUrl(orderId: string, paymentUrl: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({ payment_url: paymentUrl })
    .eq('id', orderId);

  if (error) {
    throw new Error('Payment URL save করা যায়নি।');
  }
}

export async function markOrderCancelled(orderId: string) {
  const supabase = createAdminClient();
  const { data: orderData } = await supabase
    .from('orders')
    .select(
      'id, user_id, course_slug, payment_status, amount, final_amount, original_amount, currency, wallet_discount_amount, referral_discount_amount, provider_invoice_id, provider_val_id, provider_transaction_id, payment_url, metadata, created_at, paid_at',
    )
    .eq('id', orderId)
    .single();

  const order = orderData as OrderRow | null;

  if (!order) {
    return { ok: false, message: 'Order পাওয়া যায়নি।' };
  }

  if (order.payment_status === 'paid') {
    return { ok: false, message: 'এই order-এর payment already successful।' };
  }

  const { data: storedOrderItems } = await supabase
    .from('order_items')
    .select('item_type, item_slug, item_title, unit_price, original_price')
    .eq('order_id', order.id);

  const orderItems = ((storedOrderItems as OrderItemRow[] | null) ?? []);
  const purchaseTracking = buildPurchaseTrackingDetails(order, orderItems);
  let nextMetadata = buildOrderMetadata(getOrderMetadata(order.metadata));
  let metadataDirty = false;
  const emailFlags = nextMetadata.emailFlags as Record<string, unknown>;

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', order.user_id)
    .single();

  const profile = (profileData as ProfileRow | null) ?? null;

  if (emailFlags.cancelledAdmin !== true) {
    try {
      await sendAdminOrderLifecycleEmail({
        status: 'cancelled',
        orderId: order.id,
        buyerName:
          typeof profile?.full_name === 'string' ? profile.full_name : undefined,
        buyerEmail: typeof profile?.email === 'string' ? profile.email : undefined,
        buyerPhone: typeof profile?.phone === 'string' ? profile.phone : undefined,
        invoiceId: order.provider_invoice_id || undefined,
        total: Number(purchaseTracking.purchaseCustomData.value ?? 0),
        paymentUrl: order.payment_url || undefined,
        items: purchaseTracking.trackedItems.map((item) => ({
          title: item.title,
          type: item.itemType,
          price: item.price,
        })),
      });

      nextMetadata = {
        ...nextMetadata,
        emailFlags: {
          ...emailFlags,
          cancelledAdmin: true,
        },
        cancelledEmailSentAt: Date.now(),
      };
      metadataDirty = true;
    } catch (error) {
      console.error('Order cancel email failed', error);
    }
  }

  const updatePayload: Record<string, unknown> = {};

  if (order.payment_status !== 'failed') {
    updatePayload.payment_status = 'failed';
  }

  if (metadataDirty) {
    updatePayload.metadata = nextMetadata;
  }

  if (Object.keys(updatePayload).length > 0) {
    await supabase.from('orders').update(updatePayload).eq('id', order.id);
  }

  return { ok: true, message: 'Payment cancel status record হয়েছে।' };
}

export async function finalizeZiniPayOrder(orderId: string, invoiceId: string) {
  const supabase = createAdminClient();
  const { data: initialOrderData } = await supabase
    .from('orders')
    .select(
      'id, user_id, course_slug, payment_status, amount, final_amount, original_amount, currency, wallet_discount_amount, referral_discount_amount, provider_invoice_id, provider_val_id, provider_transaction_id, payment_url, metadata, created_at, paid_at',
    )
    .eq('id', orderId)
    .single();

  let order = initialOrderData as OrderRow | null;

  if (!order) {
    return { ok: false, message: 'Order পাওয়া যায়নি।' };
  }

  const wasAlreadyPaid = order.payment_status === 'paid';
  let resolvedInvoiceId = order.provider_invoice_id || invoiceId;
  let resolvedValId = order.provider_val_id || resolvedInvoiceId;
  let resolvedTransactionId = order.provider_transaction_id || '';
  let justMarkedPaid = false;

  if (!wasAlreadyPaid) {
    const verification = await verifyZiniPayPayment({ invoiceId });

    if (!isZiniPayCompleted(verification)) {
      return { ok: false, message: 'Payment এখনও completed হয়নি।' };
    }

    resolvedInvoiceId = extractZiniPayInvoiceId(verification) || invoiceId;
    resolvedValId = extractZiniPayValId(verification) || resolvedInvoiceId;
    resolvedTransactionId = extractZiniPayTransactionId(verification);

    const { data: updatedOrder, error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        provider_invoice_id: resolvedInvoiceId,
        provider_val_id: resolvedValId || null,
        provider_transaction_id: resolvedTransactionId || null,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
      .select(
        'id, user_id, course_slug, payment_status, amount, final_amount, original_amount, currency, wallet_discount_amount, referral_discount_amount, provider_invoice_id, provider_val_id, provider_transaction_id, payment_url, metadata, created_at, paid_at',
      )
      .maybeSingle();

    if (orderUpdateError) {
      return { ok: false, message: 'Order update করা যায়নি।' };
    }

    if (updatedOrder) {
      order = updatedOrder as OrderRow;
      justMarkedPaid = true;
    } else {
      const { data: refreshedOrder } = await supabase
        .from('orders')
        .select(
          'id, user_id, course_slug, payment_status, amount, final_amount, original_amount, currency, wallet_discount_amount, referral_discount_amount, provider_invoice_id, provider_val_id, provider_transaction_id, payment_url, metadata, created_at, paid_at',
        )
        .eq('id', order.id)
        .single();

      order = (refreshedOrder as OrderRow | null) ?? order;
      resolvedInvoiceId = order.provider_invoice_id || resolvedInvoiceId;
      resolvedValId = order.provider_val_id || resolvedValId;
      resolvedTransactionId = order.provider_transaction_id || resolvedTransactionId;
    }
  }

  const { data: storedOrderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select('item_type, item_slug, item_title, unit_price, original_price')
    .eq('order_id', order.id);

  const orderItems = orderItemsError
    ? []
    : ((storedOrderItems as OrderItemRow[] | null) ?? []);
  const purchaseTracking = buildPurchaseTrackingDetails(order, orderItems);
  const primaryCourseSlug = purchaseTracking.primaryCourseSlug;
  let nextMetadata = buildOrderMetadata(getOrderMetadata(order.metadata));
  let metadataDirty = false;

  const { data: profileData } = await supabase
    .from('profiles')
    .select('wallet_balance, welcome_discount_uses_remaining, full_name, email, phone')
    .eq('id', order.user_id)
    .single();

  const profile = (profileData as ProfileRow | null) ?? null;

  if (justMarkedPaid) {
    const walletDiscount = toNumber(order.wallet_discount_amount);
    const referralDiscount = toNumber(order.referral_discount_amount);

    await supabase
      .from('profiles')
      .update({
        wallet_balance: Math.max(toNumber(profile?.wallet_balance) - walletDiscount, 0),
        welcome_discount_uses_remaining:
          referralDiscount > 0
            ? Math.max(Number(profile?.welcome_discount_uses_remaining ?? 0) - 1, 0)
            : Number(profile?.welcome_discount_uses_remaining ?? 0),
      })
      .eq('id', order.user_id);

    const enrolledCourses = buildEnrollmentCourses(order, orderItems);

    if (enrolledCourses.length > 0) {
      await supabase.from('enrollments').upsert(
        enrolledCourses.map((course) => ({
          user_id: order.user_id,
          course_slug: course.slug,
          course_title: course.title,
          enrollment_status: 'active',
          progress: 0,
        })),
        { onConflict: 'user_id,course_slug' },
      );
    }
  }

  const deliveryItems = buildDeliveryItems(order, orderItems);
  const deliveryResult = await ensureTelegramDeliveryLinks({
    orderId: order.id,
    items: deliveryItems,
    metadata: nextMetadata,
  });

  nextMetadata = buildOrderMetadata(deliveryResult.metadata);
  metadataDirty = metadataDirty || deliveryResult.changed;

  if (deliveryResult.errors.length > 0) {
    console.error('Telegram delivery invite failed', deliveryResult.errors.join(' | '));
  }

  const metaFlags = nextMetadata.metaFlags as Record<string, unknown>;

  if (metaFlags.purchase !== true) {
    try {
      await sendMetaConversionEvent({
        eventName: 'Purchase',
        eventId: purchaseTracking.purchaseEventId,
        eventSourceUrl: `${SITE_URL}${purchaseTracking.purchasePath}`,
        customData: purchaseTracking.purchaseCustomData,
        userData: {
          email: typeof profile?.email === 'string' ? profile.email : undefined,
          fullName: typeof profile?.full_name === 'string' ? profile.full_name : undefined,
          externalId: order.user_id,
        },
      });

      nextMetadata = {
        ...nextMetadata,
        metaFlags: {
          ...metaFlags,
          purchase: true,
          purchaseSentAt: Date.now(),
        },
      };
      metadataDirty = true;
    } catch (error) {
      console.error('Meta purchase event failed', error);
    }
  }

  const emailFlags = nextMetadata.emailFlags as Record<string, unknown>;

  try {
    if (
      emailFlags.success !== true &&
      typeof profile?.email === 'string' &&
      profile.email
    ) {
      await sendOrderConfirmationEmails({
        to: profile.email,
        fullName:
          typeof profile?.full_name === 'string' ? profile.full_name : undefined,
        orderId: order.id,
        invoiceId: resolvedInvoiceId,
        items: purchaseTracking.trackedItems.map((item) => ({
          title: item.title,
          type: item.itemType,
          price: item.price,
        })),
        total: Number(purchaseTracking.purchaseCustomData.value ?? 0),
        courseUrl: primaryCourseSlug
          ? `${SITE_URL}/courses/${primaryCourseSlug}`
          : `${SITE_URL}/dashboard`,
        deliveryLinks: deliveryResult.links.map((link) => ({
          label: link.label,
          url: link.url,
        })),
      });

      nextMetadata = {
        ...nextMetadata,
        emailFlags: {
          ...emailFlags,
          success: true,
        },
        successEmailSentAt: Date.now(),
      };
      metadataDirty = true;
    }
  } catch (error) {
    console.error('Order confirmation email failed', error);
  }

  if (nextMetadata.sheetLogged !== true) {
    const sheetLoggedAt = Date.now();
    const deliverySheetValues = getDeliverySheetValues(deliveryResult.links);
    const sheetResult = await appendSuccessfulOrderRow({
      orderId: order.id,
      status: 'paid',
      itemSummary:
        purchaseTracking.trackedItems.map((item) => item.title).join(', ') ||
        order.course_slug,
      amount: Number(purchaseTracking.purchaseCustomData.value ?? 0),
      currency: order.currency || 'BDT',
      buyerName:
        typeof profile?.full_name === 'string' && profile.full_name
          ? profile.full_name
          : 'Deshi Course User',
      buyerEmail:
        typeof profile?.email === 'string' ? profile.email : undefined,
      buyerPhone:
        typeof profile?.phone === 'string' ? profile.phone : undefined,
      discountedAmount:
        toNumber(order.original_amount) > 0
          ? Math.max(
              toNumber(order.original_amount) -
                Number(purchaseTracking.purchaseCustomData.value ?? 0),
              0,
            )
          : undefined,
      paymentUrl: order.payment_url || undefined,
      invoiceId: resolvedInvoiceId,
      valId: resolvedValId || undefined,
      transactionId: resolvedTransactionId || undefined,
      paidAt: order.paid_at || new Date().toISOString(),
      createdAt: order.created_at,
      source: buildOrderSource(order, orderItems, nextMetadata),
      courseLinks:
        deliverySheetValues.courseLinks || deliverySheetValues.templateLinks || '',
      supportLinks: deliverySheetValues.supportLinks,
      templateLinks: deliverySheetValues.templateLinks,
      successEmailSentAt:
        typeof nextMetadata.successEmailSentAt === 'number'
          ? nextMetadata.successEmailSentAt
          : undefined,
      sheetLoggedAt,
    });

    if (sheetResult.ok) {
      nextMetadata = {
        ...nextMetadata,
        sheetLogged: true,
        sheetLoggedAt,
      };
      metadataDirty = true;
    } else {
      console.error('Google Sheets append failed', sheetResult.error);
    }
  }

  if (metadataDirty) {
    await supabase
      .from('orders')
      .update({ metadata: nextMetadata })
      .eq('id', order.id);
  }

  return {
    ok: true,
    message:
      orderItems.length > 1
        ? `${orderItems.length}টি item-এর payment confirmed হয়েছে।`
        : 'Payment confirmed.',
    courseSlug: primaryCourseSlug,
    metaPurchaseEventId: purchaseTracking.purchaseEventId,
    metaPurchasePath: purchaseTracking.purchasePath,
    metaPurchaseCustomData: purchaseTracking.purchaseCustomData,
  };
}
