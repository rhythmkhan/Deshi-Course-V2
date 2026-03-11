import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isMetaEventName, type MetaCustomData } from '@/lib/meta';
import { isMetaConfigured, sendMetaConversionEvent } from '@/lib/meta-server';
import { getClientIpFromHeaders, rateLimitByKey } from '@/lib/rate-limit';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookies';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

interface MetaEventRequestBody {
  eventName?: string;
  eventId?: string;
  eventSourceUrl?: string;
  customData?: MetaCustomData;
}

function getClientIpAddress(headers: Headers) {
  return getClientIpFromHeaders(headers);
}

export async function POST(request: Request) {
  if (!isMetaConfigured()) {
    return NextResponse.json({ ok: true, skipped: true }, { headers: noStoreHeaders });
  }

  const clientIp = getClientIpAddress(request.headers);
  const limit = rateLimitByKey({
    key: `meta:${clientIp}`,
    limit: 240,
    windowMs: 60 * 1000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { ok: true, skipped: true, rateLimited: true },
      {
        headers: {
          ...noStoreHeaders,
          'Retry-After': String(limit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as MetaEventRequestBody;

    if (!body.eventName || !isMetaEventName(body.eventName) || !body.eventId || !body.eventSourceUrl) {
      return NextResponse.json(
        { ok: false, message: 'Invalid Meta event payload' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const cookieStore = await cookies();
    const user = hasSupabaseAuthCookie(cookieStore.getAll())
      ? (
          await (await createClient()).auth.getUser()
        ).data.user
      : null;

    const fullName =
      (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
      (typeof user?.user_metadata?.name === 'string' && user.user_metadata.name) ||
      '';

    await sendMetaConversionEvent({
      eventName: body.eventName,
      eventId: body.eventId,
      eventSourceUrl: body.eventSourceUrl,
      customData: body.customData,
      userData: {
        email: user?.email,
        fullName,
        externalId: user?.id,
        fbp: cookieStore.get('_fbp')?.value,
        fbc: cookieStore.get('_fbc')?.value,
        clientIpAddress: clientIp,
        clientUserAgent: request.headers.get('user-agent') ?? '',
      },
    });

    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Meta event send failed',
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
