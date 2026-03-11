import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import CommerceProviders from '@/components/CommerceProviders';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Payments | দেশি কোর্স',
  description: 'দেশি কোর্স payment status pages',
  path: '/payments',
  noIndex: true,
});

export default function PaymentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CommerceProviders>{children}</CommerceProviders>;
}
