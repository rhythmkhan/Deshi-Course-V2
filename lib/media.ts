import 'server-only';
import crypto from 'crypto';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingRelationError } from '@/lib/supabase/errors';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export interface MediaVariantSpec {
  key: string;
  width: number;
  height: number;
}

export interface UploadProcessedAssetInput {
  file: File;
  bucket?: string;
  folder?: string;
  altText?: string;
  createdBy?: string;
  variants?: MediaVariantSpec[];
  maxBytes?: number;
}

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function getDefaultVariants() {
  return [
    { key: 'thumb', width: 480, height: 360 },
    { key: 'card', width: 960, height: 720 },
    { key: 'hero', width: 1440, height: 1080 },
  ] satisfies MediaVariantSpec[];
}

async function uploadBuffer(bucket: string, path: string, buffer: Buffer, contentType: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
    cacheControl: '31536000',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadProcessedAsset(input: UploadProcessedAssetInput) {
  if (!ALLOWED_IMAGE_TYPES.has(input.file.type)) {
    throw new Error('JPG, PNG, WebP বা AVIF image দিন।');
  }

  const maxBytes = input.maxBytes ?? 6 * 1024 * 1024;

  if (input.file.size > maxBytes) {
    throw new Error(`Image size ${Math.round(maxBytes / (1024 * 1024))}MB-এর বেশি হতে পারবে না।`);
  }

  const bucket = input.bucket ?? process.env.SUPABASE_MEDIA_BUCKET ?? 'site-media';
  const folder = input.folder ?? 'uploads';
  const fileName = slugifyFileName(input.file.name.replace(/\.[^.]+$/, '')) || 'asset';
  const assetKey = `${fileName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const arrayBuffer = await input.file.arrayBuffer();
  const sourceBuffer = Buffer.from(arrayBuffer);
  const baseImage = sharp(sourceBuffer, { failOn: 'none' }).rotate();
  const metadata = await baseImage.metadata();
  const optimizedBuffer = await baseImage
    .webp({
      quality: 82,
      effort: 5,
    })
    .toBuffer();

  const mainPath = `${folder}/${assetKey}.webp`;
  await uploadBuffer(bucket, mainPath, optimizedBuffer, 'image/webp');

  const variants = input.variants ?? getDefaultVariants();
  const uploadedVariants: Record<string, { path: string; width: number; height: number }> = {};

  for (const variant of variants) {
    const variantPath = `${folder}/${assetKey}-${variant.key}.webp`;
    const variantBuffer = await sharp(sourceBuffer, { failOn: 'none' })
      .rotate()
      .resize({
        width: variant.width,
        height: variant.height,
        fit: 'cover',
        position: sharp.strategy.attention,
      })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();

    await uploadBuffer(bucket, variantPath, variantBuffer, 'image/webp');
    uploadedVariants[variant.key] = {
      path: variantPath,
      width: variant.width,
      height: variant.height,
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      bucket,
      path: mainPath,
      kind: 'image',
      alt_text: input.altText ?? null,
      original_filename: input.file.name,
      mime_type: 'image/webp',
      size_bytes: optimizedBuffer.byteLength,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      variants: uploadedVariants,
      created_by: input.createdBy ?? null,
      metadata: {
        originalMimeType: input.file.type,
        originalSize: input.file.size,
      },
    })
    .select('*')
    .single();

  if (error) {
    if (isMissingRelationError(error, 'media_assets')) {
      return {
        id: null,
        bucket,
        path: mainPath,
        variants: uploadedVariants,
      };
    }

    throw new Error(error.message);
  }

  return data;
}

export async function bindMediaAssetUsage(input: {
  assetId: string;
  entityType: string;
  entityId: string;
  fieldName: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('media_asset_usages').upsert(
    {
      asset_id: input.assetId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      field_name: input.fieldName,
    },
    { onConflict: 'asset_id,entity_type,entity_id,field_name' },
  );

  if (error && !isMissingRelationError(error, 'media_asset_usages')) {
    throw new Error(error.message);
  }
}

export async function replaceMediaAsset(input: {
  previousAssetId?: string | null;
  file: File;
  bucket?: string;
  folder?: string;
  altText?: string;
  createdBy?: string;
}) {
  const nextAsset = await uploadProcessedAsset(input);

  if (input.previousAssetId) {
    await softDeleteMediaAsset(input.previousAssetId);
  }

  return nextAsset;
}

export async function softDeleteMediaAsset(assetId: string) {
  const supabase = createAdminClient();
  const usageQuery = await supabase
    .from('media_asset_usages')
    .select('id', { count: 'exact', head: true })
    .eq('asset_id', assetId);

  if (!usageQuery.error && (usageQuery.count ?? 0) > 0) {
    throw new Error('এই asset এখনও use হচ্ছে, তাই delete করা যাবে না।');
  }

  const { error } = await supabase
    .from('media_assets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', assetId);

  if (error && !isMissingRelationError(error, 'media_assets')) {
    throw new Error(error.message);
  }
}
