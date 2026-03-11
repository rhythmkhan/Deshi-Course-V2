const DEFAULT_SITE_URL = 'https://deshicourse.xyz';

type HeaderReader = {
  get(name: string): string | null;
};

function normalizeSiteUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function getEnvSiteUrl() {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeSiteUrl(process.env.SITE_URL) ||
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeSiteUrl(process.env.VERCEL_URL) ||
    normalizeSiteUrl(process.env.APP_URL) ||
    DEFAULT_SITE_URL
  );
}

export const SITE_URL = getEnvSiteUrl();

export function getRequestSiteUrl({
  request,
  headers,
}: {
  request?: Request;
  headers?: HeaderReader;
} = {}) {
  const forwardedHost = headers?.get('x-forwarded-host');
  const forwardedProto = headers?.get('x-forwarded-proto');

  if (forwardedHost) {
    return normalizeSiteUrl(`${forwardedProto || 'https'}://${forwardedHost}`) || SITE_URL;
  }

  if (headers?.get('host')) {
    return normalizeSiteUrl(`https://${headers.get('host')}`) || SITE_URL;
  }

  if (request) {
    return normalizeSiteUrl(new URL(request.url).origin) || SITE_URL;
  }

  return SITE_URL;
}
