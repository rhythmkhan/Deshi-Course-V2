import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import CommerceProviders from '@/components/CommerceProviders';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'কার্ট | দেশি কোর্স',
  description: 'দেশি কোর্স cart page',
  path: '/cart',
  noIndex: true,
});

export default function CartLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CommerceProviders>{children}</CommerceProviders>;
}
