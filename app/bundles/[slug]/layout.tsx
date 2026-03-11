import type { ReactNode } from 'react';
import CommerceProviders from '@/components/CommerceProviders';

export default function BundleDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CommerceProviders>{children}</CommerceProviders>;
}
