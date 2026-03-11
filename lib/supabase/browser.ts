import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

function getBrowserSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  };
}

export function isBrowserSupabaseConfigured() {
  const { url, key } = getBrowserSupabaseConfig();
  return Boolean(url && key);
}

export function createClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  const { url, key } = getBrowserSupabaseConfig();

  if (!url || !key) {
    return null;
  }

  browserClient = createBrowserClient(url, key);

  return browserClient;
}
