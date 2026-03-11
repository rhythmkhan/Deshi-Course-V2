import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import CommerceProviders from '@/components/CommerceProviders';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'ড্যাশবোর্ড | দেশি কোর্স',
  description: 'শিক্ষার্থীর dashboard page',
  path: '/dashboard',
  noIndex: true,
});

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CommerceProviders>{children}</CommerceProviders>;
}
