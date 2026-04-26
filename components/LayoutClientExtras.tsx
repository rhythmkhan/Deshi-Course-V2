'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const isPrivateRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/update-password');

  if (isPrivateRoute) {
    return null;
  }

  return (
    <>
      <AuthCodeRedirect />
      <FloatingWhatsAppButton />
    </>
  );
}
