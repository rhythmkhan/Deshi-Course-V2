import 'server-only';
import { JWT } from 'google-auth-library';

type SheetsResult = { ok: true } | { ok: false; error: string };
type SheetsRowResult =
  | { ok: true; rowIndex: number }
  | { ok: false; error: string; code?: 'not_found' };

export interface GoogleSheetsOrderPayload {
  orderId: string;
  status: string;
  itemSummary: string;
  amount: number;
  currency: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  discountedAmount?: number;
  paymentUrl?: string;
  invoiceId?: string;
  valId?: string;
  transactionId?: string;
  paidAt?: string | number | Date | null;
  createdAt?: string | number | Date | null;
  source?: string;
  courseLinks?: string;
  supportLinks?: string;
  templateLinks?: string;
  successEmailSentAt?: number;
  sheetLoggedAt?: number;
}

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.GOOGLE_SHEETS_SHEET_ID ||
  '';
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

function formatDhakaDateTime(value?: string | number | Date | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const date =
    value instanceof Date
      ? value
      : typeof value === 'number'
        ? new Date(value)
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date
    .toLocaleString('en-GB', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(',', '');
}

function requireConfig(): SheetsResult {
  if (!SHEET_ID || !SHEET_NAME || !CLIENT_EMAIL || !PRIVATE_KEY) {
    return { ok: false, error: 'Google Sheets config missing.' };
  }

  return { ok: true };
}

async function getAccessToken(): Promise<string> {
  const globalState = globalThis as typeof globalThis & {
    __deshicourseGoogleSheetsToken?: { token: string; expiresAt: number };
  };

  const cachedToken = globalState.__deshicourseGoogleSheetsToken;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Sheets credentials missing.');
  }

  const client = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: [SHEETS_SCOPE],
  });
  const tokens = await client.authorize();

  if (!tokens.access_token) {
    throw new Error('Failed to get Google Sheets access token.');
  }

  globalState.__deshicourseGoogleSheetsToken = {
    token: tokens.access_token,
    expiresAt:
      typeof tokens.expiry_date === 'number'
        ? tokens.expiry_date
        : Date.now() + 45 * 60 * 1000,
  };

  return tokens.access_token;
}

async function findRowByOrderId(orderId: string): Promise<SheetsRowResult> {
  const configOk = requireConfig();

  if (!configOk.ok) {
    return configOk;
  }

  try {
    const accessToken = await getAccessToken();
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
      `${SHEET_NAME}!A:A`,
    )}`;
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');

      return {
        ok: false,
        error: errorBody || `Google Sheets API error (${response.status}).`,
      };
    }

    const data = (await response.json()) as { values?: string[][] };
    const values = data.values ?? [];

    for (let index = 1; index < values.length; index += 1) {
      const cell = values[index]?.[0];

      if (cell && String(cell).trim() === orderId) {
        return { ok: true, rowIndex: index + 1 };
      }
    }

    return { ok: false, error: 'Order ID not found in sheet.', code: 'not_found' };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Google Sheets lookup failed.',
    };
  }
}

export async function appendSuccessfulOrderRow(
  payload: GoogleSheetsOrderPayload,
): Promise<SheetsResult> {
  const configOk = requireConfig();

  if (!configOk.ok) {
    return configOk;
  }

  const existingRow = await findRowByOrderId(payload.orderId);

  if (existingRow.ok) {
    return { ok: true };
  }

  if (!existingRow.ok && existingRow.code !== 'not_found') {
    return existingRow;
  }

  const row = [
    payload.orderId,
    payload.status,
    payload.itemSummary,
    payload.amount,
    payload.currency,
    payload.buyerName ?? '-',
    payload.buyerEmail ?? '-',
    payload.buyerPhone ?? '-',
    '',
    payload.discountedAmount ?? '',
    payload.paymentUrl ?? '-',
    payload.invoiceId ?? '-',
    payload.valId ?? '-',
    payload.transactionId ?? '-',
    formatDhakaDateTime(payload.paidAt),
    formatDhakaDateTime(payload.createdAt),
    payload.source ?? '-',
    payload.courseLinks ?? '',
    payload.supportLinks ?? '',
    payload.templateLinks ?? '',
    formatDhakaDateTime(payload.successEmailSentAt),
    formatDhakaDateTime(payload.sheetLoggedAt ?? Date.now()),
    '',
    '',
    '',
    '',
    '',
  ];

  try {
    const accessToken = await getAccessToken();
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
      `${SHEET_NAME}!A1:append`,
    )}?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');

      return {
        ok: false,
        error: errorBody || `Google Sheets API error (${response.status}).`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Google Sheets request failed.',
    };
  }
}
