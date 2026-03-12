'use client';

import dynamic from 'next/dynamic';

const AuthCodeRedirect = dynamic(() => import('@/components/AuthCodeRedirect'), {
  ssr: false,
});

const FloatingWhatsAppButton = dynamic(
  () => import('@/components/FloatingWhatsAppButton'),
  {
    ssr: false,
  },
);

export default function LayoutClientExtras() {
  return (
    <>
      <AuthCodeRedirect />
      <FloatingWhatsAppButton />
    </>
  );
}
