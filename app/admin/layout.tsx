import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import BrandLogo from '@/components/BrandLogo';
import { requireAdmin } from '@/lib/admin-auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Admin Panel | DeshiCourse',
  description: 'Internal admin panel for DeshiCourse',
  path: '/admin',
  noIndex: true,
});

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { adminEmail } = await requireAdmin();
  const adminInitial = adminEmail.slice(0, 1).toUpperCase();

  return (
    <main className="min-h-dvh bg-gray-50 text-gray-900">
      <div className="flex min-h-dvh flex-col overflow-x-hidden lg:h-screen lg:flex-row lg:overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:hidden">
          <div>
            <BrandLogo size="sm" textClassName="text-lg" />
            <p className="mt-1 text-xs text-gray-500">Simple admin controls</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-brand/15 bg-white px-3 py-2 text-xs font-semibold text-brand"
            >
              Site
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/10 bg-brand/10 text-sm font-bold text-brand">
              {adminInitial}
            </div>
          </div>
        </header>

        <aside className="hidden w-[292px] flex-shrink-0 border-r border-gray-100 bg-white lg:flex lg:flex-col">
          <div className="px-6 pb-6 pt-8">
            <BrandLogo size="md" />
          </div>

          <div className="px-4 pb-4">
            <div className="rounded-[2rem] bg-gradient-to-br from-brand via-brand to-brand-dark p-[1px] shadow-[0_24px_60px_-36px_rgba(76,29,149,0.42)]">
              <div className="rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,rgba(109,40,217,0.14),rgba(255,255,255,0.98))] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Admin</p>
                <h2 className="mt-3 text-xl font-extrabold text-gray-900">Control Center</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Member dashboard-এর মতো menu ধরে simple ভাবে সব control সাজানো।
                </p>
                <div className="mt-4 inline-flex rounded-full border border-brand/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand">
                  Easy, section-based workflow
                </div>
              </div>
            </div>
          </div>

          <AdminNav />

          <div className="mt-auto border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 rounded-[1.6rem] border border-gray-100 bg-gray-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/10 bg-brand/10 text-sm font-bold text-brand">
                {adminInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">Admin user</p>
                <p className="truncate text-xs text-gray-500">{adminEmail}</p>
              </div>
            </div>
            <Link
              href="/"
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-brand/15 bg-white px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/5"
            >
              Public site দেখুন
            </Link>
          </div>
        </aside>

        <section className="relative flex-grow overflow-y-auto">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.10),transparent_52%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_44%)]" />
          <div className="relative mx-auto w-full max-w-7xl p-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] sm:p-6 lg:p-8 lg:pb-10">
            <header className="mb-6 rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.24)] backdrop-blur sm:p-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">DeshiCourse Admin</p>
                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    Member dashboard-এর মতো easy, section-wise control panel
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Users, orders, coupons আর courses আলাদা menu-তে আছে। যেটা দরকার, শুধু ওই section-এ যান।
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-brand/5 px-4 py-2 text-sm font-semibold text-brand">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                    {adminEmail}
                  </div>
                  <Link
                    href="/"
                    className="inline-flex rounded-2xl border border-brand/15 bg-white px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/5"
                  >
                    Public site
                  </Link>
                </div>
              </div>
            </header>

            {children}
          </div>
        </section>
      </div>
      <AdminNav variant="mobile" />
    </main>
  );
}
