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

function getDefaultProtocolForHost(host: string) {
  const normalizedHost = host.trim().toLowerCase();

  if (
    normalizedHost.startsWith('localhost') ||
    normalizedHost.startsWith('127.0.0.1') ||
    normalizedHost.startsWith('[::1]') ||
    normalizedHost.endsWith('.local')
  ) {
    return 'http';
  }

  return 'https';
}

function buildOriginFromHost(host: string, protocol?: string | null) {
  const safeProtocol = protocol || getDefaultProtocolForHost(host);
  return normalizeSiteUrl(`${safeProtocol}://${host}`);
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
  const requestOrigin = request ? normalizeSiteUrl(new URL(request.url).origin) : null;
  const forwardedHost = headers?.get('x-forwarded-host');
  const forwardedProto = headers?.get('x-forwarded-proto');

  if (forwardedHost) {
    return buildOriginFromHost(
      forwardedHost,
      forwardedProto || (requestOrigin ? new URL(requestOrigin).protocol.replace(':', '') : null),
    ) || SITE_URL;
  }

  if (headers?.get('host')) {
    return buildOriginFromHost(
      headers.get('host') as string,
      requestOrigin ? new URL(requestOrigin).protocol.replace(':', '') : null,
    ) || requestOrigin || SITE_URL;
  }

  if (requestOrigin) {
    return requestOrigin;
  }

  return SITE_URL;
}
