'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/browser';

interface AuthContextValue {
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isSupabaseLockAbort(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
      error.message.includes("Lock broken by another request with the 'steal' option."))
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = Boolean(supabase);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const client = supabase;

    let isMounted = true;

    async function loadSession() {
      try {
        const {
          data: { session: nextSession },
        } = await client.auth.getSession();

        if (isMounted) {
          setSession(nextSession ?? null);
        }
      } catch (error) {
        if (!isSupabaseLockAbort(error)) {
          console.error('Supabase session read failed', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      supabase,
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      isConfigured,
    }),
    [isConfigured, isLoading, session, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
