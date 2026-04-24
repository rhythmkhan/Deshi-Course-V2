import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  assertAuthAllowedByEmail,
  noStoreHeaders,
  recordAuthFailure,
  safeRedirectSchema,
} from '@/app/api/auth/shared';

const signUpSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  referralCode: z.string().trim().optional(),
  redirectTo: safeRedirectSchema,
});

export async function POST(request: Request) {
  let email = '';

  try {
    const body = signUpSchema.parse(await request.json());
    email = body.email.trim().toLowerCase();
    const { userId } = await assertAuthAllowedByEmail(email);
    const supabase = await createClient();
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.searchParams.set('next', body.redirectTo);

    if (body.referralCode) {
      callbackUrl.searchParams.set('ref', body.referralCode.trim().toUpperCase());
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: body.password,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        data: {
          full_name: body.fullName,
          pending_referral_code: body.referralCode?.trim().toUpperCase() || undefined,
        },
      },
    });

    if (error) {
      await recordAuthFailure({
        eventType: 'password_sign_up',
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
        message:
          'অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল confirmation link দেখে account verify করুন।',
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Account create করা যায়নি। পরে আবার চেষ্টা করুন।';

    if (email) {
      await recordAuthFailure({
        eventType: 'password_sign_up',
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
