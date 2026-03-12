'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, LoaderCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import BrandLogo from '@/components/BrandLogo';
import { createClient, isBrowserSupabaseConfigured } from '@/lib/supabase/browser';

type UpdatePasswordPageClientProps = {
  initialErrorMessage?: string;
};

export default function UpdatePasswordPageClient({
  initialErrorMessage = '',
}: UpdatePasswordPageClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const isSupabaseConfigured = isBrowserSupabaseConfigured();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    if (password.length < 8) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('দুইটি পাসওয়ার্ড এক হতে হবে।');
      return;
    }

    setIsSubmitting(true);

    if (!supabase) {
      setErrorMessage('Auth system configure করা নেই। পরে আবার চেষ্টা করুন।');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage('পাসওয়ার্ড update হয়েছে। ড্যাশবোর্ডে নেওয়া হচ্ছে...');
    router.push('/dashboard');
    router.refresh();
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
          <h2 className="text-2xl font-bold text-gray-900">নতুন পাসওয়ার্ড সেট করুন</h2>
          <p className="text-gray-500">একটি নতুন শক্তিশালী পাসওয়ার্ড দিন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">নতুন পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
                placeholder="কমপক্ষে ৮ অক্ষর"
                disabled={!isSupabaseConfigured}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">পাসওয়ার্ড নিশ্চিত করুন</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
                placeholder="আবার পাসওয়ার্ড লিখুন"
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
            <span>পাসওয়ার্ড আপডেট করুন</span>
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
