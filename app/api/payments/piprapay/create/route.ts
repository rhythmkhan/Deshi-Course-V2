import { NextResponse } from 'next/server';
import {
  attachOrderPaymentUrl,
  createPendingCartOrder,
  createPendingOrder,
  notifyAdminPendingOrderCreated,
} from '@/lib/payments';
import { type CartItemInput } from '@/lib/cart';
import { createPipraPayPayment } from '@/lib/piprapay';
import { getClientIpFromHeaders, rateLimitByKey } from '@/lib/rate-limit';
import { getRequestSiteUrl } from '@/lib/site-url';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

function buildResponseHeaders(timings?: { orderMs: number; gatewayMs: number; totalMs: number }) {
  return {
    ...noStoreHeaders,
    ...(timings
      ? {
          'Server-Timing': [
            `order;dur=${timings.orderMs.toFixed(1)}`,
            `piprapay;dur=${timings.gatewayMs.toFixed(1)}`,
            `total;dur=${timings.totalMs.toFixed(1)}`,
          ].join(', '),
        }
      : {}),
  };
}

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    const clientIp = getClientIpFromHeaders(request.headers);
    const limit = rateLimitByKey({
      key: `piprapay-create:${clientIp}`,
      limit: 12,
      windowMs: 5 * 60 * 1000,
    });

    if (!limit.ok) {
      return NextResponse.json(
        { error: 'অনেক দ্রুত checkout request এসেছে। একটু পরে আবার চেষ্টা করুন।' },
        {
          status: 429,
          headers: {
            ...buildResponseHeaders(),
            'Retry-After': String(limit.retryAfterSeconds),
          },
        },
      );
    }

    if (!process.env.PIPRAPAY_API_KEY) {
      return NextResponse.json(
        { error: 'Pipra Pay API key set করা নেই।' },
        { status: 400, headers: buildResponseHeaders() },
      );
    }

    const body = (await request.json()) as {
      courseSlug?: string;
      items?: CartItemInput[];
      couponCode?: string;
      source?: 'course' | 'cart';
    };

    const checkoutItems = Array.isArray(body.items) ? body.items : [];
    const isCartCheckout = checkoutItems.length > 0;

    if (!isCartCheckout && (!body.courseSlug || typeof body.courseSlug !== 'string')) {
      return NextResponse.json(
        { error: 'Course slug বা cart items দরকার।' },
        { status: 400, headers: buildResponseHeaders() },
      );
    }

    const fromCartParam = isCartCheckout || body.source === 'cart' ? '&fromCart=1' : '';
    const orderStartedAt = performance.now();
    const pending = isCartCheckout
      ? await createPendingCartOrder(checkoutItems, body.couponCode)
      : await createPendingOrder(body.courseSlug as string, body.couponCode);
    const orderFinishedAt = performance.now();
    const baseUrl = getRequestSiteUrl({ request, headers: request.headers });
    const itemSummary = isCartCheckout
      ? `${(pending as Awaited<ReturnType<typeof createPendingCartOrder>>).items.length} items`
      : (pending as Awaited<ReturnType<typeof createPendingOrder>>).course.title;
    const metadata: Record<string, string | number | boolean> = isCartCheckout
      ? {
          orderId: pending.orderId,
          itemCount: (pending as Awaited<ReturnType<typeof createPendingCartOrder>>).items.length,
          itemSlugs: (pending as Awaited<ReturnType<typeof createPendingCartOrder>>).items
            .map((item) => `${item.type}:${item.slug}`)
            .join(','),
          userId: pending.user.id,
          couponCode: pending.pricing.appliedCoupon?.code ?? '',
          source: 'cart',
        }
      : {
          orderId: pending.orderId,
          courseSlug: (pending as Awaited<ReturnType<typeof createPendingOrder>>).course.slug,
          userId: pending.user.id,
          couponCode: pending.pricing.appliedCoupon?.code ?? '',
          source: 'course',
        };

    const gatewayStartedAt = performance.now();
    const payment = await createPipraPayPayment({
      fullName: pending.customerName,
      emailOrMobile: pending.customerEmail,
      amount: pending.pricing.finalPrice.toFixed(2),
      currency: 'BDT',
      returnUrl: `${baseUrl}/payments/success?orderId=${pending.orderId}${fromCartParam}`,
      webhookUrl: `${baseUrl}/api/payments/piprapay/webhook`,
      metadata,
      packageLabel: itemSummary,
    });
    const gatewayFinishedAt = performance.now();

    await attachOrderPaymentUrl(pending.orderId, payment.checkoutUrl, {
      provider: 'piprapay',
      providerInvoiceId: payment.ppId || null,
      providerValId: payment.ppId || null,
      payload: payment.payload,
    });

    try {
      await notifyAdminPendingOrderCreated({
        orderId: pending.orderId,
        customerName: pending.customerName,
        customerEmail: pending.customerEmail,
        total: pending.pricing.finalPrice,
        paymentUrl: payment.checkoutUrl,
        items: isCartCheckout
          ? (pending as Awaited<ReturnType<typeof createPendingCartOrder>>).items.map((item) => ({
              title: item.title,
              type: item.type,
              price: item.price,
            }))
          : [
              {
                title: (pending as Awaited<ReturnType<typeof createPendingOrder>>).course.title,
                type: 'course' as const,
                price: (pending as Awaited<ReturnType<typeof createPendingOrder>>).course.price,
              },
            ],
      });
    } catch (error) {
      console.error('Pending order admin email failed', error);
    }

    return NextResponse.json(
      { paymentUrl: payment.checkoutUrl },
      {
        headers: buildResponseHeaders({
          orderMs: orderFinishedAt - orderStartedAt,
          gatewayMs: gatewayFinishedAt - gatewayStartedAt,
          totalMs: gatewayFinishedAt - startedAt,
        }),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Sign in করে আবার চেষ্টা করুন।' },
        { status: 401, headers: buildResponseHeaders() },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment init failed' },
      { status: 500, headers: buildResponseHeaders() },
    );
  }
}
