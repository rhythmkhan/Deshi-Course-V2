import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'সাইন ইন | দেশি কোর্স',
  description: 'দেশি কোর্স account sign in page',
  path: '/signin',
  noIndex: true,
});

export default function SignInLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
