'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, LoaderCircle, Mail, Send } from 'lucide-react';
import { motion } from 'motion/react';
import BrandLogo from '@/components/BrandLogo';
import { createClient, isBrowserSupabaseConfigured } from '@/lib/supabase/browser';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const isSupabaseConfigured = isBrowserSupabaseConfigured();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setErrorMessage('');

    if (!supabase) {
      setErrorMessage('Auth system configure করা নেই। পরে আবার চেষ্টা করুন।');
      setIsSubmitting(false);
      return;
    }

    const redirectTo = `${window.location.origin}/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage('পাসওয়ার্ড reset link আপনার ইমেইলে পাঠানো হয়েছে।');
    setIsSubmitting(false);
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
          <h2 className="text-2xl font-bold text-gray-900">পাসওয়ার্ড পুনরুদ্ধার</h2>
          <p className="text-gray-500">আপনার ইমেইল দিন, আমরা একটি লিঙ্ক পাঠাবো</p>
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
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span>লিঙ্ক পাঠান</span>
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/signin" className="inline-flex items-center space-x-2 text-sm font-bold text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>সাইন ইন পেজে ফিরে যান</span>
          </Link>
        </div>

        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand/5" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-brand/5" />
      </motion.div>
    </main>
  );
}
