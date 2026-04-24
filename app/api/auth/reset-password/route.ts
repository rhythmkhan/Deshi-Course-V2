import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  assertAuthAllowedByEmail,
  noStoreHeaders,
  recordAuthFailure,
} from '@/app/api/auth/shared';

const resetSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  let email = '';

  try {
    const body = resetSchema.parse(await request.json());
    email = body.email.trim().toLowerCase();
    const { userId } = await assertAuthAllowedByEmail(email);
    const supabase = await createClient();
    const redirectTo = new URL('/auth/callback', request.url);
    redirectTo.searchParams.set('next', '/update-password');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo.toString(),
    });

    if (error) {
      await recordAuthFailure({
        eventType: 'password_reset_request',
        email,
        userId,
        message: error.message,
      });

      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: noStoreHeaders },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'পাসওয়ার্ড reset link আপনার email-এ পাঠানো হয়েছে।',
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Reset link পাঠানো যায়নি।';

    if (email) {
      await recordAuthFailure({
        eventType: 'password_reset_request',
        email,
        message,
      });
    }

    return NextResponse.json(
      { error: message },
      { status: 400, headers: noStoreHeaders },
    );
  }
}
