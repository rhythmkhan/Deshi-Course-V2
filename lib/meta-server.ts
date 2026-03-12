import { createHash } from 'crypto';
import { shouldSkipMetaTrackingUrl, type MetaCustomData, type MetaEventName } from '@/lib/meta';

const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION ?? 'v22.0';
const META_TIMEOUT_MS = 8000;

interface MetaServerUserData {
  email?: string;
  fullName?: string;
  externalId?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

interface SendMetaConversionEventInput {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  customData?: MetaCustomData;
  userData?: MetaServerUserData;
}

function getPixelId() {
  return process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
}

function getAccessToken() {
  return process.env.META_CAPI_ACCESS_TOKEN || '';
}

function getTestEventCode() {
  return process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE || process.env.META_TEST_EVENT_CODE || '';
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function sanitizeNamePart(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z\u00c0-\u024f\u1e00-\u1eff\u0980-\u09ff]/g, '');
}

function sanitizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return { firstName: '', lastName: '' };
  }

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null || entry === '') {
        return false;
      }

      if (Array.isArray(entry)) {
        return entry.length > 0;
      }

      return true;
    }),
  );
}

function buildUserData(userData?: MetaServerUserData) {
  if (!userData) {
    return {};
  }

  const fullName = userData.fullName?.trim() ?? '';
  const { firstName, lastName } = splitFullName(fullName);

  return compactObject({
    em: userData.email ? [hashValue(sanitizeEmail(userData.email))] : undefined,
    fn: firstName ? [hashValue(sanitizeNamePart(firstName))] : undefined,
    ln: lastName ? [hashValue(sanitizeNamePart(lastName))] : undefined,
    external_id: userData.externalId ? [hashValue(userData.externalId.trim())] : undefined,
    fbp: userData.fbp?.trim(),
    fbc: userData.fbc?.trim(),
    client_ip_address: userData.clientIpAddress?.trim(),
    client_user_agent: userData.clientUserAgent?.trim(),
  });
}

function buildCustomData(customData?: MetaCustomData) {
  if (!customData) {
    return {};
  }

  return compactObject({
    currency: customData.currency,
    value: typeof customData.value === 'number' ? Number(customData.value.toFixed(2)) : undefined,
    content_name: customData.content_name,
    content_type: customData.content_type,
    content_category: customData.content_category,
    content_ids: customData.content_ids?.filter(Boolean),
    contents: customData.contents?.filter((entry) => entry.id && entry.quantity > 0),
    num_items: customData.num_items,
  });
}

export function isMetaConfigured() {
  return Boolean(getPixelId() && getAccessToken());
}

export async function sendMetaConversionEvent({
  eventName,
  eventId,
  eventSourceUrl,
  customData,
  userData,
}: SendMetaConversionEventInput) {
  const pixelId = getPixelId();
  const accessToken = getAccessToken();

  if (!pixelId || !accessToken || !eventSourceUrl || shouldSkipMetaTrackingUrl(eventSourceUrl)) {
    return { ok: false, skipped: true } as const;
  }

  const endpoint = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}/events`);
  endpoint.searchParams.set('access_token', accessToken);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      compactObject({
        data: [
          compactObject({
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: 'website',
            event_source_url: eventSourceUrl,
            user_data: buildUserData(userData),
            custom_data: buildCustomData(customData),
          }),
        ],
        test_event_code: getTestEventCode() || undefined,
      }),
    ),
    cache: 'no-store',
    signal: AbortSignal.timeout(META_TIMEOUT_MS),
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      typeof payload.error === 'object' && payload.error !== null && 'message' in payload.error
        ? String((payload.error as { message?: string }).message ?? 'Meta CAPI request failed')
        : typeof payload.message === 'string'
          ? payload.message
          : `Meta CAPI request failed with status ${response.status}`,
    );
  }

  return { ok: true, skipped: false, payload } as const;
}
