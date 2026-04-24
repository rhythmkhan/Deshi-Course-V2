import { NextResponse } from 'next/server';
import {
  extractPipraPayId,
  extractPipraPayOrderId,
  getPipraPayConfig,
  verifyPipraPayPayment,
} from '@/lib/piprapay';
import { finalizePipraPayOrder } from '@/lib/payments';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

export async function POST(request: Request) {
  try {
    const { apiKey } = getPipraPayConfig();
    const received =
      request.headers.get('mh-piprapay-api-key') ||
      request.headers.get('Mh-Piprapay-Api-Key') ||
      request.headers.get('MHS-PIPRAPAY-API-KEY');

    if (received !== apiKey) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized request' },
        { status: 401, headers: noStoreHeaders },
      );
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const ppId = extractPipraPayId(payload);

    if (!ppId) {
      return NextResponse.json(
        { ok: false, message: 'Missing pp_id' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const verification = await verifyPipraPayPayment(ppId);
    const orderId = extractPipraPayOrderId(verification) || extractPipraPayOrderId(payload);

    if (!orderId) {
      return NextResponse.json(
        { ok: false, message: 'Missing orderId in Pipra Pay metadata' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const result = await finalizePipraPayOrder(orderId, ppId);

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
      headers: noStoreHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Webhook parse failed',
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
