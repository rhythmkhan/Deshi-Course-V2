const DEFAULT_ADMIN_EMAILS = ['seratul.alim@gmail.com'];

export function normalizeAdminEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getAdminAllowlistFromEnv(raw?: string) {
  const fromEnv = (raw ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(normalizeAdminEmail);

  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv]));
}

export function isAdminEmail(email: string | null | undefined, rawAllowlist?: string) {
  if (!email) {
    return false;
  }

  return getAdminAllowlistFromEnv(rawAllowlist).includes(normalizeAdminEmail(email));
}
