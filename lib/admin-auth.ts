import { redirect } from 'next/navigation';
import { getAdminAllowlistFromEnv, normalizeAdminEmail } from '@/lib/admin-access';
import { createClient } from '@/lib/supabase/server';

export function getAdminAllowlist() {
  return getAdminAllowlistFromEnv(process.env.ADMIN_EMAIL_ALLOWLIST);
}

export async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const adminEmails = getAdminAllowlist();
  const normalizedEmail = normalizeAdminEmail(user.email);

  if (!adminEmails.includes(normalizedEmail)) {
    return null;
  }

  return {
    user,
    adminEmail: normalizedEmail,
  };
}

export async function requireAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect('/signin?redirect=/admin');
  }

  return admin;
}
