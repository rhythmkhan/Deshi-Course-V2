'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, LoaderCircle, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import BrandLogo from '@/components/BrandLogo';
import { createClient, isBrowserSupabaseConfigured } from '@/lib/supabase/browser';

function SignInPageFallback() {
  return (
    <main className="min-h-screen bg-purple-50 p-4 sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2.5rem] sm:p-8 lg:p-10">
        <div className="mb-8 text-center sm:mb-10">
          <BrandLogo size="md" className="mb-6 justify-center" />
          <h2 className="text-2xl font-bold text-gray-900">স্বাগতম!</h2>
          <p className="text-gray-500">সাইন ইন ফর্ম লোড হচ্ছে...</p>
        </div>
      </div>
    </main>
  );
}

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isSupabaseConfigured = isBrowserSupabaseConfigured();
  const redirectTarget = useMemo(() => {
    const redirect = searchParams.get('redirect');
    return redirect && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/dashboard';
  }, [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(() => {
    const error = searchParams.get('error');
    const reason = searchParams.get('reason');

    if (error === 'access_blocked') {
      if (reason === 'ip_blocked') {
        return 'এই network/IP থেকে access temporarily blocked করা হয়েছে।';
      }

      if (reason) {
        return reason;
      }

      return 'এই account দিয়ে এখন sign in করা যাবে না।';
    }

    if (error === 'session_revoked') {
      return 'নিরাপত্তার কারণে আবার sign in করতে হবে।';
    }

    if (error !== 'auth_callback_failed') {
      return '';
    }

    if (reason === 'missing_auth_code') {
      return 'সাইন ইন লিংকটি অসম্পূর্ণ ছিল। আবার চেষ্টা করুন।';
    }

    if (reason) {
      return `সাইন ইন সম্পন্ন করা যায়নি: ${reason}`;
    }

    return 'সাইন ইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।';
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setMessage('');

    if (!supabase) {
      setErrorMessage('Auth system configure করা নেই। পরে আবার চেষ্টা করুন।');
      setIsSubmitting(false);
      return;
    }

    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        redirectTo: redirectTarget,
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      redirectTo?: string;
    };

    if (!response.ok) {
      setErrorMessage(data.error || 'Sign in করা যায়নি।');
      setIsSubmitting(false);
      return;
    }

    router.push(data.redirectTo || redirectTarget);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    setErrorMessage('');
    setMessage('');

    if (!supabase) {
      setErrorMessage('Auth system configure করা নেই। পরে আবার চেষ্টা করুন।');
      setIsSubmitting(false);
      return;
    }

    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTarget)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-purple-50 p-4 sm:flex sm:items-center sm:justify-center sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2.5rem] sm:p-8 lg:p-10"
      >
        <div className="mb-8 text-center sm:mb-10">
          <BrandLogo size="md" className="mb-6 justify-center" />
          <h2 className="text-2xl font-bold text-gray-900">স্বাগতম!</h2>
          <p className="text-gray-500">আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
                placeholder="আপনার ইমেইল লিখুন"
                disabled={!isSupabaseConfigured}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="ml-1 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-bold text-gray-700">পাসওয়ার্ড</label>
              <Link href="/forgot-password" className="text-xs font-bold text-brand hover:underline">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                disabled={!isSupabaseConfigured}
              />
            </div>
          </div>

          {!isSupabaseConfigured && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Supabase public auth config missing. `NEXT_PUBLIC_SUPABASE_URL` এবং publishable key set করতে হবে।
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || !isSupabaseConfigured}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-lg transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70 sm:text-lg"
          >
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            <span>সাইন ইন</span>
          </motion.button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-sm text-gray-400">অথবা</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || !isSupabaseConfigured}
            className="flex w-full items-center justify-center space-x-3 rounded-2xl border border-gray-200 bg-white py-4 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm sm:text-base">গুগল দিয়ে সাইন ইন করুন</span>
          </motion.button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            অ্যাকাউন্ট নেই?{' '}
            <Link
              href={redirectTarget !== '/dashboard' ? `/signup?redirect=${encodeURIComponent(redirectTarget)}` : '/signup'}
              className="font-bold text-brand hover:underline"
            >
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>

        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand/5" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-brand/5" />
      </motion.div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageFallback />}>
      <SignInPageContent />
    </Suspense>
  );
}
