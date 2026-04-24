import { NextResponse } from 'next/server';
import { processPendingDeliveryJobs } from '@/lib/delivery';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

function isAuthorized(request: Request) {
  const secret = process.env.APP_CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get('authorization')?.trim();
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: noStoreHeaders },
    );
  }

  try {
    await processPendingDeliveryJobs(25);

    return NextResponse.json(
      { ok: true },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Delivery queue processing failed',
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
