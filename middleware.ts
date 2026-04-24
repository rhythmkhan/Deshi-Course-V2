import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/auth/callback/:path*',
    '/forgot-password/:path*',
    '/signin',
    '/signup',
    '/admin/:path*',
    '/cart/:path*',
    '/dashboard/:path*',
    '/update-password/:path*',
  ],
};
