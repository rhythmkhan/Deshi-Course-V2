import { NextResponse } from 'next/server';
import { getCoursePrimaryLinkMap } from '@/lib/catalog-sync';

export const revalidate = 300;

export async function GET() {
  const links = await getCoursePrimaryLinkMap().catch(() => ({}));
  return NextResponse.json({ links });
}
