'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Package2,
  Settings,
  ShieldCheck,
  TicketPercent,
  Truck,
  Users,
} from 'lucide-react';

const MAIN_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    mobileLabel: 'Home',
    helper: 'সব section-এর summary',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/users',
    label: 'Users',
    mobileLabel: 'Users',
    helper: 'member profiles, notes, access',
    icon: Users,
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    mobileLabel: 'Orders',
    helper: 'payment, timeline, reconciliation',
    icon: CircleDollarSign,
  },
  {
    href: '/admin/catalog/courses',
    label: 'Catalog',
    mobileLabel: 'Catalog',
    helper: 'courses, bundles, products',
    icon: Package2,
  },
  {
    href: '/admin/coupons',
    label: 'Coupons',
    mobileLabel: 'Offers',
    helper: 'discount rules and analytics',
    icon: TicketPercent,
  },
];

const OPS_ITEMS = [
  {
    href: '/admin/content/blog',
    label: 'Content',
    helper: 'blog, FAQ, homepage, testimonials',
    icon: FileText,
  },
  {
    href: '/admin/delivery-jobs',
    label: 'Delivery',
    helper: 'Telegram, Drive, email queue',
    icon: Truck,
  },
  {
    href: '/admin/security',
    label: 'Security',
    helper: 'blocked IPs, auth risk, sessions',
    icon: ShieldCheck,
  },
  {
    href: '/admin/audit',
    label: 'Audit',
    helper: 'append-only admin activity log',
    icon: BookOpen,
  },
  {
    href: '/admin/settings/integrations',
    label: 'Settings',
    helper: 'integrations and site settings',
    icon: Settings,
  },
];

function NavLink({
  href,
  label,
  helper,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  helper: string;
  icon: typeof LayoutDashboard;
  pathname: string;
}) {
  const isActive =
    pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`group flex w-full items-center gap-3 rounded-[1.35rem] px-3 py-3 text-left transition ${
        isActive
          ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/10'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
          isActive
            ? 'bg-brand/10 text-brand ring-brand/10'
            : 'bg-white text-gray-400 ring-gray-100 group-hover:text-gray-700'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>{label}</p>
        <p className={`mt-0.5 text-xs ${isActive ? 'text-brand/80' : 'text-gray-400'}`}>
          {helper}
        </p>
      </div>
      {isActive ? (
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-brand ring-1 ring-brand/10">
          Open
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
      )}
    </Link>
  );
}

export default function AdminNav({
  variant = 'desktop',
}: {
  variant?: 'desktop' | 'mobile';
}) {
  const pathname = usePathname();

  if (variant === 'mobile') {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 gap-1 border-t border-gray-100 bg-white/98 px-2 py-2 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur lg:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
      >
        {MAIN_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-1 rounded-xl transition ${
                isActive ? 'bg-brand/8 text-brand' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-grow overflow-y-auto px-4 pb-6">
      <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-gray-100 bg-gray-50/80 p-3">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Main
          </p>
          {MAIN_ITEMS.map((item) => (
            <NavLink key={item.href} pathname={pathname} {...item} />
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-gray-100 bg-gray-50/80 p-3">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Operations
          </p>
          {OPS_ITEMS.map((item) => (
            <NavLink key={item.href} pathname={pathname} {...item} />
          ))}
        </div>
      </div>
    </nav>
  );
}
