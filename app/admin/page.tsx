import Link from 'next/link';
import { ArrowUpRight, BookOpen, CircleDollarSign, ShieldCheck, Truck, Users } from 'lucide-react';
import { syncLegacyContentAction } from '@/app/admin/actions';
import { listManagedCourses } from '@/lib/content-store';
import { AdminShell, StatCard } from '@/lib/admin-ui';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminPage() {
  const supabase = createAdminClient();
  const [courses, usersCount, ordersCount, couponsCount, enrollmentsCount, deliveryCount] =
    await Promise.all([
      listManagedCourses(),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('coupons').select('id', { count: 'exact', head: true }),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      supabase.from('delivery_jobs').select('id', { count: 'exact', head: true }),
    ]);

  const shortcuts = [
    {
      href: '/admin/users',
      label: 'Users',
      helper: 'নাম, phone, member details update করুন',
      value: String(usersCount.count ?? 0),
      icon: Users,
    },
    {
      href: '/admin/orders',
      label: 'Orders',
      helper: 'payment status আর delivery follow-up',
      value: String(ordersCount.count ?? 0),
      icon: CircleDollarSign,
    },
    {
      href: '/admin/coupons',
      label: 'Coupons',
      helper: 'offer code চালু, বন্ধ, manage করুন',
      value: String(couponsCount.count ?? 0),
      icon: ShieldCheck,
    },
    {
      href: '/admin/catalog/courses',
      label: 'Catalog',
      helper: 'courses, bundles, products manage',
      value: String(courses.length),
      icon: BookOpen,
    },
    {
      href: '/admin/delivery-jobs',
      label: 'Delivery',
      helper: 'queue, retries, provider errors',
      value: String(deliveryCount.count ?? 0),
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
          <div className="bg-[linear-gradient(135deg,rgba(109,40,217,0.12),rgba(255,255,255,0.98))] p-6 sm:p-8">
            <div className="inline-flex rounded-full border border-brand/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Admin home
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              এক নজরে পুরো admin panel
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Member dashboard-এর মতো section ধরে কাজ করুন। user লাগলে Users, payment issue হলে Orders, offer লাগলে Coupons।
            </p>
          </div>
          <div className="grid gap-4 border-t border-gray-100 p-6 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Users" value={String(usersCount.count ?? 0)} note="মোট user account" />
            <StatCard label="Orders" value={String(ordersCount.count ?? 0)} note="মোট order" />
            <StatCard label="Coupons" value={String(couponsCount.count ?? 0)} note="মোট coupon" />
            <StatCard label="Access" value={String(enrollmentsCount.count ?? 0)} note="মোট enrollment" />
            <StatCard label="Delivery" value={String(deliveryCount.count ?? 0)} note="মোট delivery job" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-brand/10 bg-[linear-gradient(180deg,rgba(109,40,217,0.10),rgba(255,255,255,0.98))] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Quick action</p>
          <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Content sync</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            পুরনো catalog/blog data database-এ তুলতে একবার sync চালান। এতে existing site content নতুন DB layer-এ চলে যাবে।
          </p>
          <form action={syncLegacyContentAction} className="mt-5">
            <button className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-brand px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/20">
              Sync content to database
            </button>
          </form>
          <div className="mt-5 rounded-[1.5rem] border border-brand/10 bg-white/80 p-4">
            <p className="text-sm font-bold text-gray-900">কখন এটা ব্যবহার করবেন?</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              নতুন setup, migration-এর পর, বা যখন code-based content database-এ তুলতে হবে।
            </p>
          </div>
        </div>
      </section>

      <AdminShell
        title="Section Shortcuts"
        subtitle="নিচের card-এ click করে direct ওই কাজের page-এ যান।"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {shortcuts.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 transition group-hover:text-brand">
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-5 text-sm font-semibold text-brand">{item.label}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-gray-500">{item.helper}</p>
              </Link>
            );
          })}
        </div>
      </AdminShell>

      <AdminShell
        title="Course Library"
        subtitle="Live course list member dashboard-এর card rhythm-এ দেখা যাবে।"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.slug}
              className="overflow-hidden rounded-[1.8rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="border-b border-gray-100 bg-[linear-gradient(135deg,rgba(109,40,217,0.10),rgba(255,255,255,0.98))] p-5">
                <div className="inline-flex rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  {course.level}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{course.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{course.slug}</p>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">{course.category}</span>
                  <span className="text-2xl font-extrabold text-brand">৳{course.price}</span>
                </div>
                <Link
                  href={`/admin/courses`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand/8 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/12"
                >
                  Manage in Courses
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </AdminShell>
    </div>
  );
}
