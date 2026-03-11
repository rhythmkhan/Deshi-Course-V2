import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'সাইন আপ | দেশি কোর্স',
  description: 'দেশি কোর্স account sign up page',
  path: '/signup',
  noIndex: true,
});

export default function SignUpLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
