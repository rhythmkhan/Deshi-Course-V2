interface SupabaseAuthCookie {
  name: string;
}

export function hasSupabaseAuthCookie(cookies: readonly SupabaseAuthCookie[]) {
  return cookies.some(({ name }) => {
    return (
      name.includes('supabase-auth-token') ||
      (name.startsWith('sb-') && name.includes('-auth-token'))
    );
  });
}
