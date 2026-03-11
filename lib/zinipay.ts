const ZINIPAY_API_BASE = 'https://api.zinipay.com/v1/payment';
const ZINIPAY_TIMEOUT_MS = 8000;

export interface ZiniPayCreatePayload {
  amount: string;
  redirect_url: string;
  cancel_url: string;
  webhook_url: string;
  cus_name?: string;
  cus_email: string;
  metadata?: Record<string, string | number>;
  return_type?: 'GET' | 'POST';
}

export interface ZiniPayVerifyPayload {
  invoiceId: string;
}

function readPayloadString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === 'string' && value) {
      return value;
    }
  }

  if (payload.data && typeof payload.data === 'object' && payload.data !== null) {
    return readPayloadString(payload.data as Record<string, unknown>, keys);
  }

  return '';
}

function getHeaders() {
  const apiKey = process.env.ZINIPAY_API_KEY;

  if (!apiKey) {
    throw new Error('ZINIPAY_API_KEY is missing');
  }

  return {
    'Content-Type': 'application/json',
    'zini-api-key': apiKey,
  };
}

async function parseZiniPayResponse(response: Response) {
  const payload = (await response.json()) as Record<string, unknown>;

  if (response.ok) {
    return payload;
  }

  const message =
    typeof payload.message === 'string'
      ? payload.message
      : typeof payload.error === 'string'
        ? payload.error
        : `ZiniPay request failed with status ${response.status}`;

  throw new Error(message);
}

export async function createZiniPayPayment(payload: ZiniPayCreatePayload) {
  const response = await fetch(`${ZINIPAY_API_BASE}/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(ZINIPAY_TIMEOUT_MS),
  });

  return parseZiniPayResponse(response);
}

export async function verifyZiniPayPayment(payload: ZiniPayVerifyPayload) {
  const response = await fetch(`${ZINIPAY_API_BASE}/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(ZINIPAY_TIMEOUT_MS),
  });

  return parseZiniPayResponse(response);
}

export function isZiniPayCompleted(payload: Record<string, unknown>) {
  const topLevelStatus = typeof payload.status === 'string' ? payload.status.toUpperCase() : payload.status;
  const nestedStatus =
    payload.data && typeof payload.data === 'object' && payload.data !== null && 'status' in payload.data
      ? String((payload.data as { status?: string }).status ?? '').toUpperCase()
      : '';

  return (
    topLevelStatus === 'COMPLETED' ||
    topLevelStatus === 'PAID' ||
    topLevelStatus === 'SUCCESS' ||
    topLevelStatus === true ||
    nestedStatus === 'COMPLETED' ||
    nestedStatus === 'PAID' ||
    nestedStatus === 'SUCCESS'
  );
}

export function extractZiniPayInvoiceId(payload: Record<string, unknown>) {
  return readPayloadString(payload, ['invoiceId', 'invoice_id', 'val_id']);
}

export function extractZiniPayValId(payload: Record<string, unknown>) {
  return readPayloadString(payload, ['val_id', 'valId', 'invoiceId', 'invoice_id']);
}

export function extractZiniPayTransactionId(payload: Record<string, unknown>) {
  return readPayloadString(payload, ['transaction_id', 'transactionId', 'trxID', 'trxId']);
}
