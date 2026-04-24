const DEFAULT_PIPRAPAY_BASE_URL = 'https://payment.deshicourse.xyz/api';
const PIPRAPAY_TIMEOUT_MS = 10000;

export interface PipraPayCreatePayload {
  fullName: string;
  emailOrMobile: string;
  amount: string;
  currency?: string;
  returnUrl: string;
  webhookUrl: string;
  metadata?: Record<string, string | number | boolean>;
  packageLabel?: string;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing`);
  }

  return value;
}

export function getPipraPayConfig() {
  return {
    apiKey: getRequiredEnv('PIPRAPAY_API_KEY'),
    baseUrl: process.env.PIPRAPAY_BASE_URL || DEFAULT_PIPRAPAY_BASE_URL,
  };
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

export function buildPipraPayUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedBaseUrl.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${normalizedBaseUrl}${normalizedPath.slice(4)}`;
  }

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function getPipraPayHeaders(apiKey: string) {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    'MHS-PIPRAPAY-API-KEY': apiKey,
    'mh-piprapay-api-key': apiKey,
  };
}

export async function parsePipraPayResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();

  if (contentType.includes('application/json')) {
    return JSON.parse(rawBody) as Record<string, unknown>;
  }

  return { raw: rawBody } satisfies Record<string, unknown>;
}

export function pickCheckoutUrl(
  payload: unknown,
  options?: { responseUrl?: string; requestUrl?: string },
): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of ['payment_url', 'checkout_url', 'redirect_url', 'url', 'pp_url']) {
    const value = record[key];

    if (typeof value === 'string' && value.startsWith('http')) {
      return value;
    }
  }

  if (typeof record.data === 'object' && record.data) {
    const nested: string | null = pickCheckoutUrl(record.data);

    if (nested) {
      return nested;
    }
  }

  if (typeof record.raw === 'string') {
    const match = record.raw.match(/https?:\/\/[^\s"'<>]+/i);

    if (match) {
      return match[0];
    }
  }

  if (
    options?.responseUrl &&
    options.responseUrl.startsWith('http') &&
    options.responseUrl !== options.requestUrl
  ) {
    return options.responseUrl;
  }

  return null;
}

export function getStringField(payload: unknown, keys: string[]): string {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if (record.data && typeof record.data === 'object') {
    return getStringField(record.data, keys);
  }

  return '';
}

export function parsePipraPayStatus(payload: unknown) {
  const status = getStringField(payload, ['status', 'payment_status', 'state', 'message']) || 'unknown';

  return {
    status,
    ok: /success|completed|paid|verified/i.test(status),
  };
}

export function classifyPaymentStatus(rawStatus: string | null | undefined) {
  const status = (rawStatus || 'unknown').toLowerCase();

  if (/success|completed|paid|verified/.test(status)) {
    return { kind: 'success' as const, label: rawStatus || 'success' };
  }

  if (/cancel|cancelled|canceled/.test(status)) {
    return { kind: 'cancelled' as const, label: rawStatus || 'cancelled' };
  }

  if (/fail|failed|error|declined|expired|invalid/.test(status)) {
    return { kind: 'failed' as const, label: rawStatus || 'failed' };
  }

  if (/pending|processing|created|initiated/.test(status)) {
    return { kind: 'pending' as const, label: rawStatus || 'pending' };
  }

  return { kind: 'unknown' as const, label: rawStatus || 'unknown' };
}

export function isPipraPayCompleted(payload: unknown) {
  return parsePipraPayStatus(payload).ok;
}

export function extractPipraPayId(payload: unknown) {
  return getStringField(payload, ['pp_id']);
}

export function extractPipraPayTransactionId(payload: unknown) {
  return getStringField(payload, ['transaction_ref', 'trx_id', 'transaction_id']);
}

function parseMetadataValue(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }

  return {};
}

export function getPipraPayMetadata(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const record = payload as Record<string, unknown>;

  if ('metadata' in record) {
    return parseMetadataValue(record.metadata);
  }

  if (record.data && typeof record.data === 'object') {
    return getPipraPayMetadata(record.data);
  }

  return {};
}

export function extractPipraPayOrderId(payload: unknown) {
  const directOrderId = getStringField(payload, ['orderId', 'order_id']);

  if (directOrderId) {
    return directOrderId;
  }

  const metadata = getPipraPayMetadata(payload);
  return typeof metadata.orderId === 'string' ? metadata.orderId : '';
}

export async function createPipraPayPayment(payload: PipraPayCreatePayload) {
  const { apiKey, baseUrl } = getPipraPayConfig();
  const requestUrl = buildPipraPayUrl(baseUrl, '/api/checkout/redirect');
  const isEmail = payload.emailOrMobile.includes('@');
  const requestBody = {
    full_name: payload.fullName,
    email_address: isEmail ? payload.emailOrMobile : 'support@deshicourse.xyz',
    mobile_number: isEmail ? '01700000000' : payload.emailOrMobile,
    amount: payload.amount,
    currency: (payload.currency || 'BDT').toUpperCase(),
    metadata: JSON.stringify({
      ...(payload.metadata ?? {}),
      customer_contact: payload.emailOrMobile,
      expected_amount: payload.amount,
      package_label: payload.packageLabel ?? `Package BDT ${payload.amount}`,
    }),
    return_url: payload.returnUrl,
    webhook_url: payload.webhookUrl,
  };

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: getPipraPayHeaders(apiKey),
    body: JSON.stringify(requestBody),
    cache: 'no-store',
    signal: AbortSignal.timeout(PIPRAPAY_TIMEOUT_MS),
  });
  const data = await parsePipraPayResponse(response);
  const checkoutUrl = pickCheckoutUrl(data, {
    responseUrl: response.url,
    requestUrl,
  });

  if (!response.ok) {
    const message =
      getStringField(data, ['message', 'error']) ||
      `Pipra Pay request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!checkoutUrl) {
    throw new Error('Pipra Pay checkout URL পাওয়া যায়নি।');
  }

  return {
    payload: data,
    checkoutUrl,
    ppId: extractPipraPayId(data),
  };
}

export async function verifyPipraPayPayment(ppId: string) {
  const { apiKey, baseUrl } = getPipraPayConfig();
  const endpoints = ['/api/verify-payment', '/api/verify-payments'];
  let lastErrorMessage = 'Pipra Pay verification failed';

  for (const endpoint of endpoints) {
    const response = await fetch(buildPipraPayUrl(baseUrl, endpoint), {
      method: 'POST',
      headers: getPipraPayHeaders(apiKey),
      body: JSON.stringify({ pp_id: ppId }),
      cache: 'no-store',
      signal: AbortSignal.timeout(PIPRAPAY_TIMEOUT_MS),
    });
    const data = await parsePipraPayResponse(response);

    if (response.ok) {
      return data;
    }

    if (response.status !== 404) {
      lastErrorMessage =
        getStringField(data, ['message', 'error']) || lastErrorMessage;
      break;
    }
  }

  throw new Error(lastErrorMessage);
}
