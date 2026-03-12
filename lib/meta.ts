export const META_STANDARD_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Purchase',
] as const);

export type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export interface MetaContentEntry {
  id: string;
  quantity: number;
  item_price?: number;
}

export interface MetaCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_type?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: MetaContentEntry[];
  num_items?: number;
}

export function isMetaEventName(value: string): value is MetaEventName {
  return META_STANDARD_EVENTS.has(value as MetaEventName);
}

export function buildMetaContentType(itemType: string, itemCount = 1) {
  if (itemCount > 1) {
    return 'product_group';
  }

  switch (itemType) {
    case 'course':
      return 'course';
    case 'bundle':
      return 'bundle';
    case 'shop':
      return 'digital_product';
    default:
      return itemType;
  }
}

export function isLocalTrackingUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  } catch {
    return false;
  }
}

function parseBooleanFlag(value?: string | null) {
  if (!value) {
    return false;
  }

  switch (value.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true;
    default:
      return false;
  }
}

export function isMetaLocalTrackingEnabled() {
  return parseBooleanFlag(
    process.env.NEXT_PUBLIC_META_TRACK_LOCALHOST ?? process.env.META_TRACK_LOCALHOST,
  );
}

export function shouldSkipMetaTrackingUrl(url: string) {
  return isLocalTrackingUrl(url) && !isMetaLocalTrackingEnabled();
}
