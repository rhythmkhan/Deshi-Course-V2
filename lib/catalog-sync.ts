import fs from 'fs/promises';
import path from 'path';
import { JWT } from 'google-auth-library';
import { cache } from 'react';
import { buildCatalogArt, type CatalogArtTheme } from './catalog-art';

export type ItemType = 'course' | 'bundle' | 'product';

export interface SheetCatalogItem {
  type: ItemType;
  slug: string;
  title: string;
  price: number;
  image: string;
  primaryLink: string;
  sourceRow: number;
  raw: Record<string, string>;
}

export interface SheetCourseContent {
  type: ItemType;
  title: string;
  slug: string;
  image: string;
  primaryLink: string;
  rawText: string;
  posterTelegramFileId: string;
  sourceRow: number;
  price: number;
}

interface LocalCourseAssetManifestEntry {
  slug: string;
  image: string;
  title?: string;
  primaryLink?: string;
  rawText?: string;
  posterTelegramFileId?: string;
  sourceRow?: number;
  price?: number;
}

type SheetRow = string[];

const SHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.GOOGLE_SHEETS_SHEET_ID ||
  '';
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';
const COURSE_SHEET_ID =
  process.env.GOOGLE_SHEETS_COURSE_SPREADSHEET_ID ||
  '1sjEGtTic3FfXIoS4DmufpOEES3RZRAeH_MTFfahshP4';
const COURSE_SHEET_NAME = process.env.GOOGLE_SHEETS_COURSE_SHEET_NAME || 'Sheet1';
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '';
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_COURSE_PREVIEW_BOT_TOKEN ||
  process.env.TELEGRAM_BOT_TOKEN ||
  '';
const TELEGRAM_CHAT_HANDLE = process.env.TELEGRAM_CHAT_HANDLE || '@SeratulAlimKhan';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const TYPE_ALIASES: Record<ItemType, string[]> = {
  course: ['course', 'courses', 'কোর্স'],
  bundle: ['bundle', 'bundles', 'বান্ডেল'],
  product: ['product', 'products', 'প্রডাক্ট', 'product item', 'shop'],
};

const PRICE_TIERS = [99, 499, 999] as const;
const IMPORTED_COURSE_EASY_KEYWORDS = [
  'basic',
  'beginner',
  'easy',
  'starter',
  'intro',
  'introduction',
  'crash course',
  'guideline',
  'solutions',
  'free',
];
const IMPORTED_COURSE_ADVANCED_KEYWORDS = [
  'advance',
  'advanced',
  'mastery',
  'masterclass',
  'complete',
  'full course',
  'full stack',
  'a z',
  'a-z',
  'ultimate',
  'bootcamp',
  'program',
  'lab',
  'pro',
  'professional',
];
const MIXED_BUNDLE_KEYWORDS = [
  'bundle',
  'বান্ডেল',
  'combo',
  'all courses',
  'all paid course',
  '3 in 1',
];
const MIXED_PRODUCT_KEYWORDS = [
  'template',
  'templates',
  'clip',
  'clips',
  'font',
  'fonts',
  'book',
  'books',
  'bot',
  'asset',
  'assets',
  'material',
  'materials',
  'theme',
  'themes',
  'plugin',
  'plugins',
  'mockup',
  'mockups',
  'pack',
  'package',
  'certificate',
  'tool',
  'tools',
  'stock',
  'library',
  'credit',
  'resource',
  'resources',
  'poster design',
  'drive link',
  'offer',
  'hackpack',
  'lifetime',
];
const MIXED_COURSE_KEYWORDS = [
  'course',
  'training',
  'masterclass',
  'bootcamp',
  'batch',
  'blueprint',
  'program',
  'preparation',
  'university',
  'academy',
  'class',
  'lab',
];

function buildTelegramPreviewPath(fileId: string) {
  return `/api/course-preview?fileId=${encodeURIComponent(fileId)}`;
}

function columnToIndex(column: string) {
  let index = 0;
  for (const char of column.toUpperCase()) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }
  return index - 1;
}

function getCell(row: SheetRow, column: string) {
  return row[columnToIndex(column)]?.trim() ?? '';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\u0980-\u09ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeType(value: string, type: ItemType) {
  const text = normalizeText(value);
  return TYPE_ALIASES[type].some((alias) => text.includes(alias));
}

function detectType(row: SheetRow): ItemType | null {
  const candidates = [getCell(row, 'type'), getCell(row, 'category'), getCell(row, 'kind')];
  for (const value of candidates) {
    if (!value) continue;
    if (looksLikeType(value, 'course')) return 'course';
    if (looksLikeType(value, 'bundle')) return 'bundle';
    if (looksLikeType(value, 'product')) return 'product';
  }

  const title = normalizeText(getCell(row, 'H') || getCell(row, 'G'));
  if (title.includes('bundle')) return 'bundle';
  if (title.includes('course')) return 'course';
  if (title.includes('product') || title.includes('credit') || title.includes('template')) return 'product';
  return null;
}

function includesAnyKeyword(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function inferMixedContentType(title: string, rawText: string, row: SheetRow): ItemType {
  const explicitType = detectType(row);
  if (explicitType) {
    return explicitType;
  }

  const normalizedTitle = normalizeText(title);
  const normalizedRawText = normalizeText(rawText);
  const combined = `${normalizedTitle} ${normalizedRawText}`.trim();

  if (
    normalizedTitle.includes('course name') ||
    normalizedRawText.includes('course name') ||
    includesAnyKeyword(normalizedTitle, MIXED_COURSE_KEYWORDS) ||
    includesAnyKeyword(combined, MIXED_COURSE_KEYWORDS)
  ) {
    return 'course';
  }

  if (
    includesAnyKeyword(normalizedTitle, MIXED_BUNDLE_KEYWORDS) ||
    includesAnyKeyword(combined, MIXED_BUNDLE_KEYWORDS)
  ) {
    return 'bundle';
  }

  if (
    includesAnyKeyword(normalizedTitle, MIXED_PRODUCT_KEYWORDS) ||
    (!includesAnyKeyword(normalizedTitle, MIXED_COURSE_KEYWORDS) &&
      includesAnyKeyword(combined, MIXED_PRODUCT_KEYWORDS))
  ) {
    return 'product';
  }

  return 'course';
}

function inferSlug(row: SheetRow, type: ItemType) {
  const directSlug = getCell(row, 'A');
  if (directSlug) return slugify(directSlug);
  const title = getCell(row, 'H') || getCell(row, 'G');
  return slugify(title) || `${type}-${row.length}`;
}

function inferTitle(row: SheetRow) {
  return getCell(row, 'H') || getCell(row, 'G');
}

function inferPrice(row: SheetRow) {
  const candidates = [getCell(row, 'price'), getCell(row, 'Price'), getCell(row, 'amount'), getCell(row, 'value')];
  for (const candidate of candidates) {
    const parsed = Number(candidate.replace(/[^\d.]/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) {
      if (parsed <= 99) return 99;
      if (parsed <= 499) return 499;
      return 999;
    }
  }
  return 99;
}

export function inferImportedCoursePrice(title: string, rawText: string) {
  const normalizedTitle = normalizeText(title);
  const normalizedRawText = normalizeText(rawText);
  const combined = `${normalizedTitle} ${normalizedRawText}`.trim();

  if (
    includesAnyKeyword(normalizedTitle, IMPORTED_COURSE_EASY_KEYWORDS) ||
    includesAnyKeyword(combined, IMPORTED_COURSE_EASY_KEYWORDS)
  ) {
    return 99;
  }

  if (
    includesAnyKeyword(normalizedTitle, IMPORTED_COURSE_ADVANCED_KEYWORDS) ||
    includesAnyKeyword(combined, IMPORTED_COURSE_ADVANCED_KEYWORDS)
  ) {
    return 499;
  }

  return 299;
}

function fallbackImage(title: string, type: ItemType) {
  const theme: CatalogArtTheme =
    type === 'bundle'
      ? 'bundle'
      : type === 'product'
        ? 'tool'
        : 'code';
  return buildCatalogArt(title, theme, type[0].toUpperCase() + type.slice(1));
}

function pickImageFromText(text: string, type: ItemType) {
  const normalized = normalizeText(text);
  if (!normalized) return '';
  const signal = normalized.replace(/\s+/g, '-').slice(0, 80);
  return `/images/${type}s/${signal}.webp`;
}

async function getAccessToken() {
  if (!CLIENT_EMAIL || !PRIVATE_KEY) return '';
  const client = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: [SHEETS_SCOPE],
  });
  const tokens = await client.authorize();
  return tokens.access_token || '';
}

async function readSheetValues(range: string): Promise<SheetRow[]> {
  if (!SHEET_ID || !SHEET_NAME) return [];
  const token = await getAccessToken();
  if (!token) return [];
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(`${SHEET_NAME}!${range}`)}`;
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { values?: SheetRow[] };
  return data.values ?? [];
}

async function readCourseSheetValues(range: string): Promise<SheetRow[]> {
  if (!COURSE_SHEET_ID || !COURSE_SHEET_NAME) return [];
  const token = await getAccessToken();
  if (!token) return [];
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${COURSE_SHEET_ID}/values/${encodeURIComponent(`${COURSE_SHEET_NAME}!${range}`)}`;
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { values?: SheetRow[] };
  return data.values ?? [];
}

async function fetchTelegramImageQuery(query: string) {
  if (!TELEGRAM_BOT_TOKEN) return '';
  const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
  const response = await fetch(endpoint, { cache: 'no-store' });
  if (!response.ok) return '';
  const data = (await response.json()) as { ok?: boolean; result?: Array<{ message?: { text?: string; caption?: string; photo?: Array<{ file_id: string }> } }> };
  const needle = normalizeText(query);
  const match = data.result?.find((entry) => {
    const message = entry.message;
    const haystack = normalizeText(`${message?.text ?? ''} ${message?.caption ?? ''}`);
    return needle && haystack.includes(needle) && Boolean(message?.photo?.length);
  });
  return match?.message?.photo?.at(-1)?.file_id ? `telegram://file_id/${match.message.photo.at(-1)!.file_id}` : '';
}

async function resolveTelegramFileUrl(fileId: string) {
  if (!TELEGRAM_BOT_TOKEN || !fileId) return '';
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`,
    { cache: 'no-store' },
  );
  if (!response.ok) return '';
  const data = (await response.json()) as { ok?: boolean; result?: { file_path?: string } };
  const filePath = data.result?.file_path;
  return filePath ? `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}` : '';
}

function resolveType(row: SheetRow): ItemType {
  return detectType(row) ?? 'course';
}

function mapRow(row: SheetRow, sourceRow: number): SheetCatalogItem | null {
  const type = resolveType(row);
  const title = inferTitle(row);
  if (!title) return null;
  const slug = inferSlug(row, type);
  const price = inferPrice(row);
  const primaryLink = getCell(row, 'J') || getCell(row, 'primary_link') || getCell(row, 'primary link') || '';
  const imageHint = getCell(row, 'image') || getCell(row, 'image_url') || getCell(row, 'image link');
  return {
    type,
    slug,
    title,
    price,
    image: imageHint || pickImageFromText(title, type) || fallbackImage(title, type),
    primaryLink,
    sourceRow,
    raw: Object.fromEntries(row.map((value, index) => [LETTERS[index] ?? `col_${index + 1}`, value])),
  };
}

function mapCourseContentRow(row: SheetRow, sourceRow: number): SheetCourseContent | null {
  const title = inferTitle(row);
  if (!title) return null;

  const courseName = title;
  const rawText = getCell(row, 'G');
  const type = inferMixedContentType(courseName, rawText, row);
  const slug = slugify(courseName);
  const primaryLink = getCell(row, 'J');
  const posterTelegramFileId = getCell(row, 'P');
  const directLink = getCell(row, 'S');
  const price = inferPrice(row);
  return {
    type,
    title: courseName,
    slug,
    image:
      (posterTelegramFileId ? buildTelegramPreviewPath(posterTelegramFileId) : '') ||
      (directLink.includes('api.telegram.org/file/bot') && posterTelegramFileId
        ? buildTelegramPreviewPath(posterTelegramFileId)
        : directLink),
    primaryLink,
    rawText,
    posterTelegramFileId,
    sourceRow,
    price,
  };
}

function dedupeLatestBySlug<T extends { slug: string; sourceRow: number }>(items: T[]) {
  const itemBySlug = new Map<string, T>();

  for (const item of items) {
    const existing = itemBySlug.get(item.slug);

    if (!existing || item.sourceRow >= existing.sourceRow) {
      itemBySlug.set(item.slug, item);
    }
  }

  return [...itemBySlug.values()].sort((left, right) => left.sourceRow - right.sourceRow);
}

async function loadLocalCourseAssetManifest() {
  try {
    const manifestPath = path.join(process.cwd(), 'lib', 'generated', 'course-sheet-manifest.json');
    const raw = await fs.readFile(manifestPath, 'utf8');
    const parsed = JSON.parse(raw) as LocalCourseAssetManifestEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as LocalCourseAssetManifestEntry[];
  }
}

export const fetchSheetCatalogItems = cache(async function fetchSheetCatalogItems() {
  const rows = await readSheetValues('A:Z');
  if (rows.length <= 1) return [];
  return dedupeLatestBySlug(
    rows.slice(1).map(mapRow).filter((item): item is SheetCatalogItem => Boolean(item)),
  );
});

export const fetchSheetCourseContent = cache(async function fetchSheetCourseContent() {
  const allItems = await fetchSheetMixedContent();
  return allItems.filter((item) => item.type === 'course');
});

export const fetchSheetMixedContent = cache(async function fetchSheetMixedContent() {
  const rows = await readCourseSheetValues('A:Z');
  if (rows.length <= 1) return [];
  const items = dedupeLatestBySlug(
    rows
      .slice(1)
      .map(mapCourseContentRow)
      .filter((item): item is SheetCourseContent => Boolean(item))
      .map((item) => ({
        ...item,
        image: item.image || '',
      })),
  );
  const manifestEntries = await loadLocalCourseAssetManifest();
  const manifestBySlug = new Map(manifestEntries.map((entry) => [entry.slug, entry]));

  return items.map((item) => {
    const manifestEntry = manifestBySlug.get(item.slug);
    const mergedTitle = manifestEntry?.title || item.title;
    const mergedRawText = manifestEntry?.rawText || item.rawText;

    if (!manifestEntry) {
      return {
        ...item,
        price:
          item.type === 'course'
            ? inferImportedCoursePrice(item.title, item.rawText)
            : item.price,
      } satisfies SheetCourseContent;
    }

    return {
      ...item,
      type: item.type,
      image: manifestEntry.image || item.image,
      title: mergedTitle,
      primaryLink: manifestEntry.primaryLink || item.primaryLink,
      rawText: mergedRawText,
      posterTelegramFileId: manifestEntry.posterTelegramFileId || item.posterTelegramFileId,
      price:
        item.type === 'course'
          ? inferImportedCoursePrice(mergedTitle, mergedRawText)
          : manifestEntry.price ?? item.price,
      } satisfies SheetCourseContent;
  });
});

export async function getCoursePrimaryLinkBySlug(slug: string) {
  const items = await fetchSheetCourseContent();
  return items.find((item) => item.slug === slug)?.primaryLink || '';
}

export const getCoursePrimaryLinkMap = cache(async function getCoursePrimaryLinkMap() {
  const items = await fetchSheetCourseContent();
  return Object.fromEntries(
    items
      .filter((item) => item.primaryLink)
      .map((item) => [item.slug, item.primaryLink]),
  ) as Record<string, string>;
});

export const getTelegramCatalogImage = cache(async function getTelegramCatalogImage(
  query: string,
  type: ItemType,
) {
  const telegramImage = await fetchTelegramImageQuery(query);
  return telegramImage || pickImageFromText(query, type);
});

export const getTelegramCoursePreviewImage = cache(async function getTelegramCoursePreviewImage(
  fileIdOrQuery: string,
) {
  const normalized = fileIdOrQuery.trim();
  if (!normalized) return '';
  if (normalized.startsWith('Ag') || normalized.startsWith('AA')) {
    return buildTelegramPreviewPath(normalized);
  }
  const telegramMatch = await fetchTelegramImageQuery(normalized);
  if (telegramMatch.startsWith('telegram://file_id/')) {
    const fileId = telegramMatch.slice('telegram://file_id/'.length);
    return buildTelegramPreviewPath(fileId);
  }
  return telegramMatch;
});

export function normalizeCatalogPrice(price: number) {
  if (price <= 99) return 99;
  if (price <= 499) return 499;
  return 999;
}

export function getPriceTierHint(value: number) {
  return PRICE_TIERS.find((tier) => value <= tier) ?? 999;
}
