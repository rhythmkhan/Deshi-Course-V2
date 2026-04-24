import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/admin-auth';
import { uploadProcessedAsset } from '@/lib/media';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: noStoreHeaders },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Image file required' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const asset = await uploadProcessedAsset({
      file,
      folder:
        typeof formData.get('folder') === 'string'
          ? String(formData.get('folder'))
          : undefined,
      altText:
        typeof formData.get('altText') === 'string'
          ? String(formData.get('altText'))
          : undefined,
      createdBy: admin.adminEmail,
    });

    return NextResponse.json(
      { ok: true, asset },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Media upload failed',
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
