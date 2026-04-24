'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, Gift, LoaderCircle, Lock, Mail, User } from 'lucide-react';
import { motion } from 'motion/react';
import BrandLogo from '@/components/BrandLogo';
import { createClient, isBrowserSupabaseConfigured } from '@/lib/supabase/browser';

function SignUpPageFallback() {
  return (
    <main className="min-h-screen bg-purple-50 p-4 sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2.5rem] sm:p-8 lg:p-10">
        <div className="mb-8 text-center sm:mb-10">
          <BrandLogo size="md" className="mb-6 justify-center" />
          <h2 className="text-2xl font-bold text-gray-900">অ্যাকাউন্ট তৈরি করুন</h2>
          <p className="text-gray-500">সাইন আপ ফর্ম লোড হচ্ছে...</p>
        </div>
      </div>
    </main>
  );
}

function SignUpPageContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isSupabaseConfigured = isBrowserSupabaseConfigured();
  const redirectTarget = useMemo(() => {
    const redirect = searchParams.get('redirect');
    return redirect && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/dashboard';
  }, [searchParams]);
  const initialReferralCode = useMemo(() => {
    return (searchParams.get('ref') ?? '').toUpperCase();
  }, [searchParams]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        referralCode,
        redirectTo: redirectTarget,
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setErrorMessage(data.error || 'Account create করা যায়নি।');
      setIsSubmitting(false);
      return;
    }

    setMessage(
      data.message ||
        'অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল confirmation লিংক দেখে অ্যাকাউন্ট verify করুন।',
    );
    setIsSubmitting(false);
  }

  async function handleGoogleSignUp() {
    setIsSubmitting(true);
    setErrorMessage('');
    setMessage('');

    if (!supabase) {
      setErrorMessage('Auth system configure করা নেই। পরে আবার চেষ্টা করুন।');
      setIsSubmitting(false);
      return;
    }

    const callbackSearch = new URLSearchParams({
      next: redirectTarget,
    });

    if (referralCode.trim()) {
      callbackSearch.set('ref', referralCode.trim().toUpperCase());
    }

    const callbackUrl = `${window.location.origin}/auth/callback?${callbackSearch.toString()}`;

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
          <h2 className="text-2xl font-bold text-gray-900">অ্যাকাউন্ট তৈরি করুন</h2>
          <p className="text-gray-500">আমাদের সাথে আপনার শেখার যাত্রা শুরু করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">আপনার নাম</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
                placeholder="আপনার নাম লিখুন"
                disabled={!isSupabaseConfigured}
              />
            </div>
          </div>

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
            <label className="ml-1 text-sm font-bold text-gray-700">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
                placeholder="কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন"
                disabled={!isSupabaseConfigured}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="ml-1 flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-gray-700">Referral Code</label>
              <span className="text-xs font-medium text-brand">ঐচ্ছিক</span>
            </div>
            <div className="relative">
              <Gift className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 uppercase outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
                placeholder="Referral code থাকলে লিখুন"
                disabled={!isSupabaseConfigured}
              />
            </div>
            <p className="ml-1 text-xs text-gray-500">Valid code দিলে নতুন account-এ প্রথম course purchase-এ ১০% off unlock হবে।</p>
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
            className="mt-4 flex w-full items-center justify-center space-x-2 rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-lg transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70 sm:text-lg"
          >
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            <span>অ্যাকাউন্ট তৈরি করুন</span>
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
            onClick={handleGoogleSignUp}
            disabled={isSubmitting || !isSupabaseConfigured}
            className="flex w-full items-center justify-center space-x-3 rounded-2xl border border-gray-200 bg-white py-4 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm sm:text-base">গুগল দিয়ে সাইন আপ করুন</span>
          </motion.button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link
              href={redirectTarget !== '/dashboard' ? `/signin?redirect=${encodeURIComponent(redirectTarget)}` : '/signin'}
              className="font-bold text-brand hover:underline"
            >
              সাইন ইন করুন
            </Link>
          </p>
        </div>

        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand/5" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-brand/5" />
      </motion.div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpPageFallback />}>
      <SignUpPageContent />
    </Suspense>
  );
}
