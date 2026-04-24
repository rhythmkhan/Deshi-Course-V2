const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { JWT } = require('google-auth-library');

function parseEnvFile(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) {
      continue;
    }

    let [, key, value] = match;
    value = value.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value.replace(/\\n/g, '\n');
  }

  return values;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function normalizePrice(row) {
  const candidates = [row[3] || '', row[9] || ''];
  for (const candidate of candidates) {
    const parsed = Number(String(candidate).replace(/[^\d.]/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) {
      if (parsed <= 99) return 99;
      if (parsed <= 499) return 499;
      return 999;
    }
  }
  return 99;
}

async function getAccessToken(clientEmail, privateKey) {
  const client = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const { access_token } = await client.authorize();
  return access_token;
}

async function fetchSheetRows(env) {
  const spreadsheetId = env.GOOGLE_SHEETS_COURSE_SPREADSHEET_ID;
  const sheetName = env.GOOGLE_SHEETS_COURSE_SHEET_NAME || 'Sheet1';
  const accessToken = await getAccessToken(
    env.GOOGLE_SHEETS_CLIENT_EMAIL,
    env.GOOGLE_SHEETS_PRIVATE_KEY,
  );

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${sheetName}!A:Z`)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch course sheet: ${response.status}`);
  }

  const data = await response.json();
  return data.values || [];
}

async function resolveTelegramFilePath(botToken, fileId) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve Telegram file ${fileId}`);
  }

  const data = await response.json();
  if (!data?.result?.file_path) {
    throw new Error(`Telegram file path missing for ${fileId}`);
  }

  return data.result.file_path;
}

async function downloadSourceBuffer(env, row) {
  const fileId = (row[15] || '').trim();
  const directLink = (row[18] || '').trim();
  const botToken =
    env.TELEGRAM_COURSE_PREVIEW_BOT_TOKEN ||
    env.TELEGRAM_BOT_TOKEN;

  if (fileId && botToken) {
    const filePath = await resolveTelegramFilePath(botToken, fileId);
    const response = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to download Telegram image for ${fileId}`);
    }

    return {
      bytes: Buffer.from(await response.arrayBuffer()),
      posterTelegramFileId: fileId,
    };
  }

  if (directLink) {
    const response = await fetch(directLink, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to download direct image ${directLink}`);
    }

    return {
      bytes: Buffer.from(await response.arrayBuffer()),
      posterTelegramFileId: fileId,
    };
  }

  throw new Error('No image source found');
}

async function main() {
  const root = process.cwd();
  const envPath = path.join(root, '.env.local');
  const env = parseEnvFile(await fs.readFile(envPath, 'utf8'));
  const rows = await fetchSheetRows(env);
  const bodyRows = rows.slice(1);
  const deduped = new Map();

  for (let index = 0; index < bodyRows.length; index += 1) {
    const row = bodyRows[index];
    const title = String(row[7] || row[6] || '').trim();
    if (!title) {
      continue;
    }

    const slug = slugify(title);
    deduped.set(slug, { row, title, slug, sourceRow: index + 2 });
  }

  const outputDir = path.join(root, 'public', 'images', 'course-sheet');
  const manifestPath = path.join(root, 'lib', 'generated', 'course-sheet-manifest.json');
  await fs.mkdir(outputDir, { recursive: true });

  const manifest = [];
  let successCount = 0;
  let skippedCount = 0;

  for (const item of deduped.values()) {
    const { row, title, slug, sourceRow } = item;
    const rawText = String(row[6] || '').trim();
    const primaryLink = String(row[9] || '').trim();
    const price = normalizePrice(row);
    const filePath = path.join(outputDir, `${slug}.webp`);

    try {
      const source = await downloadSourceBuffer(env, row);
      const image = sharp(source.bytes, { failOn: 'none' }).rotate();
      const metadata = await image.metadata();

      // Keep cards visually stable while preserving aspect ratio.
      const webpBuffer = await image
        .resize({
          width: Math.min(metadata.width || 1200, 1200),
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 5 })
        .toBuffer();

      await fs.writeFile(filePath, webpBuffer);

      manifest.push({
        slug,
        title,
        image: `/images/course-sheet/${slug}.webp`,
        primaryLink,
        rawText,
        posterTelegramFileId: source.posterTelegramFileId,
        sourceRow,
        price,
      });
      successCount += 1;
    } catch (error) {
      manifest.push({
        slug,
        title,
        image: '',
        primaryLink,
        rawText,
        posterTelegramFileId: String(row[15] || '').trim(),
        sourceRow,
        price,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      skippedCount += 1;
    }
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        total: deduped.size,
        successCount,
        skippedCount,
        outputDir,
        manifestPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
