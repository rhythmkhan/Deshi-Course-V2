import { NextResponse } from 'next/server';
import { finalizeZiniPayOrder } from '@/lib/payments';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

function extractValue(payload: Record<string, unknown>, key: string) {
  const direct = payload[key];

  if (typeof direct === 'string' && direct) {
    return direct;
  }

  if (payload.data && typeof payload.data === 'object' && payload.data !== null) {
    const nested = (payload.data as Record<string, unknown>)[key];

    if (typeof nested === 'string' && nested) {
      return nested;
    }
  }

  return '';
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const invoiceId = extractValue(payload, 'invoiceId');
    const metadata =
      payload.metadata && typeof payload.metadata === 'object' && payload.metadata !== null
        ? (payload.metadata as Record<string, unknown>)
        : payload.data && typeof payload.data === 'object' && payload.data !== null && 'metadata' in payload.data
          ? (((payload.data as Record<string, unknown>).metadata as Record<string, unknown>) ?? {})
          : {};
    const orderId =
      extractValue(payload, 'orderId') ||
      (typeof metadata.orderId === 'string' ? metadata.orderId : '');

    if (!invoiceId || !orderId) {
      return NextResponse.json(
        { ok: false, message: 'Missing invoiceId/orderId' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const result = await finalizeZiniPayOrder(orderId, invoiceId);
    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
      headers: noStoreHeaders,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Webhook parse failed' },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
