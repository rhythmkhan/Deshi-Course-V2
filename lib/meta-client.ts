'use client';

import { META_STANDARD_EVENTS, type MetaCustomData, type MetaEventName, isLocalTrackingUrl } from '@/lib/meta';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

interface TrackMetaEventOptions {
  eventName: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string;
  customData?: MetaCustomData;
  sendBrowser?: boolean;
  sendServer?: boolean;
}

export function generateMetaEventId(prefix = 'meta') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function trackMetaEvent({
  eventName,
  eventId = generateMetaEventId(eventName.toLowerCase()),
  eventSourceUrl,
  customData,
  sendBrowser = true,
  sendServer = true,
}: TrackMetaEventOptions) {
  const resolvedUrl =
    eventSourceUrl || (typeof window !== 'undefined' ? window.location.href : '');

  if (!resolvedUrl || isLocalTrackingUrl(resolvedUrl)) {
    return eventId;
  }

  if (sendBrowser && META_PIXEL_ID && typeof window !== 'undefined' && typeof window.fbq === 'function') {
    const command = META_STANDARD_EVENTS.has(eventName) ? 'track' : 'trackCustom';
    window.fbq(command, eventName, customData ?? {}, { eventID: eventId });
  }

  if (sendServer && typeof window !== 'undefined') {
    fetch('/api/meta-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: resolvedUrl,
        customData,
      }),
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => undefined);
  }

  return eventId;
}
