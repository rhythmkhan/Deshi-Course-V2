import { NextResponse } from 'next/server';
import { isSmtpConfigured, sendContactEmails } from '@/lib/email';
import { getClientIpFromHeaders, rateLimitByKey } from '@/lib/rate-limit';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const clientIp = getClientIpFromHeaders(request.headers);
  const limit = rateLimitByKey({
    key: `contact:${clientIp}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: 'অনেক বেশি request এসেছে। একটু পরে আবার চেষ্টা করুন।' },
      {
        status: 429,
        headers: {
          ...noStoreHeaders,
          'Retry-After': String(limit.retryAfterSeconds),
        },
      },
    );
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Email system configured নেই।' },
      { status: 503, headers: noStoreHeaders },
    );
  }

  try {
    const payload = (await request.json()) as ContactPayload;
    const name = payload.name?.trim() ?? '';
    const email = payload.email?.trim() ?? '';
    const subject = payload.subject?.trim() ?? '';
    const message = payload.message?.trim() ?? '';

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { ok: false, message: 'সব field পূরণ করুন।' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: 'Valid email address দিন।' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    await sendContactEmails({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json(
      { ok: true, message: 'আপনার message পাঠানো হয়েছে। reply email-এও confirmation গেছে।' },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Message send failed',
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
