import { NextResponse } from 'next/server';
import { createFreeCourseEnrollment } from '@/lib/payments';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { courseSlug?: string };

    if (!body.courseSlug || typeof body.courseSlug !== 'string') {
      return NextResponse.json(
        { error: 'Course slug দরকার।' },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const result = await createFreeCourseEnrollment(body.courseSlug);

    return NextResponse.json(
      { ok: true, alreadyOwned: result.alreadyOwned },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Sign in করে আবার চেষ্টা করুন।' },
        { status: 401, headers: noStoreHeaders },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Free enrollment failed' },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
