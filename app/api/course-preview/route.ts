import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_COURSE_PREVIEW_BOT_TOKEN ||
  process.env.TELEGRAM_BOT_TOKEN ||
  '';

function detectImageContentType(filePath: string) {
  const normalized = filePath.toLowerCase();

  if (normalized.endsWith('.png')) {
    return 'image/png';
  }

  if (normalized.endsWith('.webp')) {
    return 'image/webp';
  }

  if (normalized.endsWith('.avif')) {
    return 'image/avif';
  }

  return 'image/jpeg';
}

export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId')?.trim() || '';

  if (!TELEGRAM_BOT_TOKEN || !fileId) {
    return new NextResponse('Missing Telegram preview config.', { status: 400 });
  }

  const fileInfoResponse = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`,
    { cache: 'no-store' },
  );

  if (!fileInfoResponse.ok) {
    return new NextResponse('Failed to resolve Telegram file.', { status: 502 });
  }

  const fileInfo = (await fileInfoResponse.json()) as {
    ok?: boolean;
    result?: { file_path?: string };
  };

  const filePath = fileInfo.result?.file_path;

  if (!filePath) {
    return new NextResponse('Telegram file path missing.', { status: 404 });
  }

  const imageResponse = await fetch(
    `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`,
    { cache: 'no-store' },
  );

  if (!imageResponse.ok) {
    return new NextResponse('Failed to fetch Telegram image.', { status: 502 });
  }

  const contentType = detectImageContentType(filePath);
  const body = await imageResponse.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
