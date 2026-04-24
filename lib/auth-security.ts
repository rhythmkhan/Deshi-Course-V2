import 'server-only';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/admin-audit';
import { getClientIpFromHeaders, rateLimitByKey } from '@/lib/rate-limit';
import {
  isMissingColumnError,
  isMissingRelationError,
} from '@/lib/supabase/errors';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

type HeaderSource = Pick<Headers, 'get'>;

export interface RequestSecurityContext {
  ipAddress: string;
  userAgent: string;
  forwardedFor: string;
  countryCode: string;
  city: string;
}

export interface LoginRiskAssessment {
  score: number;
  level: RiskLevel;
  reasons: string[];
  ipBlocked: boolean;
  userBlocked: boolean;
}

function safeHeader(headers: HeaderSource, name: string) {
  return headers.get(name)?.trim() ?? '';
}

export function getRequestSecurityContext(
  headers: HeaderSource,
): RequestSecurityContext {
  return {
    ipAddress: getClientIpFromHeaders(headers as Headers),
    userAgent: safeHeader(headers, 'user-agent'),
    forwardedFor: safeHeader(headers, 'x-forwarded-for'),
    countryCode: safeHeader(headers, 'cf-ipcountry') || safeHeader(headers, 'x-vercel-ip-country'),
    city: safeHeader(headers, 'x-vercel-ip-city'),
  };
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 80) {
    return 'critical';
  }

  if (score >= 50) {
    return 'high';
  }

  if (score >= 25) {
    return 'medium';
  }

  return 'low';
}

function isSuspiciousUserAgent(userAgent: string) {
  const normalized = userAgent.toLowerCase();
  return ['curl', 'postman', 'insomnia', 'headless', 'python', 'node-fetch'].some((token) =>
    normalized.includes(token),
  );
}

export function buildSessionKey(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 32);
}

export async function isIpBlocked(ipAddress: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('auth_ip_blocks')
    .select('ip_address, expires_at')
    .eq('ip_address', ipAddress)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1);

  if (error && !isMissingRelationError(error, 'auth_ip_blocks')) {
    throw new Error(error.message);
  }

  return ((data as Array<{ ip_address: string }> | null) ?? []).length > 0;
}

export async function isUserBlocked(userId: string) {
  const supabase = createAdminClient();
  const [profileResult, blockResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('auth_user_blocks')
      .select('user_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(1),
  ]);

  if (
    profileResult.error &&
    !isMissingColumnError(profileResult.error, 'is_blocked')
  ) {
    throw new Error(profileResult.error.message);
  }

  if (
    blockResult.error &&
    !isMissingRelationError(blockResult.error, 'auth_user_blocks')
  ) {
    throw new Error(blockResult.error.message);
  }

  return Boolean(profileResult.data?.is_blocked) || ((blockResult.data as Array<{ user_id: string }> | null) ?? []).length > 0;
}

export async function recordAuthEvent(input: {
  eventType: string;
  outcome: string;
  userId?: string | null;
  email?: string | null;
  headers: HeaderSource;
  details?: Record<string, unknown>;
  riskScore?: number;
}) {
  const supabase = createAdminClient();
  const context = getRequestSecurityContext(input.headers);
  const { error } = await supabase.from('auth_events').insert({
    user_id: input.userId ?? null,
    email: input.email ?? null,
    ip_address: context.ipAddress,
    user_agent: context.userAgent || null,
    event_type: input.eventType,
    outcome: input.outcome,
    risk_score: input.riskScore ?? 0,
    details: {
      countryCode: context.countryCode,
      city: context.city,
      ...input.details,
    },
  });

  if (error && !isMissingRelationError(error, 'auth_events')) {
    throw new Error(error.message);
  }
}

export async function observeSession(input: {
  userId: string;
  email?: string | null;
  headers: HeaderSource;
  sessionKey?: string | null;
  details?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const context = getRequestSecurityContext(input.headers);

  const [sessionResult, profileResult] = await Promise.all([
    supabase.from('session_observations').insert({
      user_id: input.userId,
      session_key: input.sessionKey ?? null,
      ip_address: context.ipAddress,
      user_agent: context.userAgent || null,
      country_code: context.countryCode || null,
      city: context.city || null,
      details: input.details ?? {},
    }),
    supabase
      .from('profiles')
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: context.ipAddress,
        last_seen_at: new Date().toISOString(),
        last_seen_user_agent: context.userAgent || null,
      })
      .eq('id', input.userId),
  ]);

  if (
    sessionResult.error &&
    !isMissingRelationError(sessionResult.error, 'session_observations')
  ) {
    throw new Error(sessionResult.error.message);
  }

  if (
    profileResult.error &&
    !isMissingColumnError(profileResult.error, 'last_login_at')
  ) {
    throw new Error(profileResult.error.message);
  }
}

export async function assessLoginRisk(input: {
  email?: string | null;
  userId?: string | null;
  headers: HeaderSource;
}) {
  const supabase = createAdminClient();
  const context = getRequestSecurityContext(input.headers);
  const reasons: string[] = [];
  let score = 0;

  const [ipBlocked, userBlocked] = await Promise.all([
    context.ipAddress === 'unknown' ? Promise.resolve(false) : isIpBlocked(context.ipAddress),
    input.userId ? isUserBlocked(input.userId) : Promise.resolve(false),
  ]);

  if (ipBlocked) {
    score += 100;
    reasons.push('Blocked IP address');
  }

  if (userBlocked) {
    score += 100;
    reasons.push('Blocked user');
  }

  if (context.forwardedFor.includes(',')) {
    score += 10;
    reasons.push('Multiple forwarded IP hops');
  }

  if (isSuspiciousUserAgent(context.userAgent)) {
    score += 20;
    reasons.push('Automation-like user agent');
  }

  const inMemoryLimit = rateLimitByKey({
    key: `auth-attempt:${context.ipAddress}`,
    limit: 12,
    windowMs: 15 * 60 * 1000,
  });

  if (!inMemoryLimit.ok) {
    score += 30;
    reasons.push('High auth request volume');
  }

  try {
    const sinceIso = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const failedQuery = await supabase
      .from('auth_events')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', context.ipAddress)
      .eq('outcome', 'failed')
      .gte('created_at', sinceIso);

    if (!failedQuery.error) {
      const recentFailures = failedQuery.count ?? 0;
      if (recentFailures > 0) {
        score += Math.min(45, recentFailures * 12);
        reasons.push(`Recent failed attempts: ${recentFailures}`);
      }
    }

    if (input.userId) {
      const sessionQuery = await supabase
        .from('session_observations')
        .select('user_agent, ip_address')
        .eq('user_id', input.userId)
        .order('seen_at', { ascending: false })
        .limit(8);

      if (!sessionQuery.error) {
        const observations =
          (sessionQuery.data as Array<{ user_agent: string | null; ip_address: string | null }> | null) ?? [];

        if (
          observations.some(
            (entry) =>
              entry.user_agent &&
              context.userAgent &&
              entry.user_agent !== context.userAgent,
          )
        ) {
          score += 15;
          reasons.push('New device or browser signature');
        }

        if (
          observations.some(
            (entry) =>
              entry.ip_address &&
              context.ipAddress &&
              entry.ip_address !== context.ipAddress,
          )
        ) {
          score += 10;
          reasons.push('Login from new IP');
        }
      }
    }
  } catch (error) {
    if (
      !isMissingRelationError(error, 'auth_events') &&
      !isMissingRelationError(error, 'session_observations')
    ) {
      throw error;
    }
  }

  const level = toRiskLevel(score);

  const riskInsert = await supabase.from('login_risk_events').insert({
    user_id: input.userId ?? null,
    email: input.email ?? null,
    ip_address: context.ipAddress,
    user_agent: context.userAgent || null,
    risk_score: score,
    risk_level: level,
    reasons,
    details: {
      countryCode: context.countryCode,
      city: context.city,
    },
  });

  if (
    riskInsert.error &&
    !isMissingRelationError(riskInsert.error, 'login_risk_events')
  ) {
    throw new Error(riskInsert.error.message);
  }

  return {
    score,
    level,
    reasons,
    ipBlocked,
    userBlocked,
  } satisfies LoginRiskAssessment;
}

export async function assertAuthAttemptAllowed(input: {
  email?: string | null;
  userId?: string | null;
  headers: HeaderSource;
}) {
  const assessment = await assessLoginRisk(input);

  if (assessment.ipBlocked) {
    throw new Error('এই IP থেকে login temporarily blocked করা হয়েছে।');
  }

  if (assessment.userBlocked) {
    throw new Error('এই account-এর access বর্তমানে বন্ধ আছে।');
  }

  if (assessment.level === 'critical') {
    throw new Error('Suspicious login activity detected. পরে আবার চেষ্টা করুন।');
  }

  return assessment;
}

export async function blockUserAccess(input: {
  userId: string;
  adminEmail: string;
  reason?: string | null;
  ipAddress?: string | null;
}) {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  await Promise.all([
    supabase
      .from('profiles')
      .update({
        is_blocked: true,
        blocked_at: nowIso,
        blocked_reason: input.reason ?? null,
        force_reauth_after: nowIso,
      })
      .eq('id', input.userId),
    supabase.from('auth_user_blocks').upsert(
      {
        user_id: input.userId,
        reason: input.reason ?? null,
        blocked_by: input.adminEmail,
        blocked_at: nowIso,
        is_active: true,
      },
      { onConflict: 'user_id' },
    ),
  ]);

  await logAdminAction({
    adminEmail: input.adminEmail,
    action: 'user.block',
    targetType: 'user',
    targetId: input.userId,
    summary: 'Blocked a user account',
    details: {
      reason: input.reason ?? null,
    },
    ipAddress: input.ipAddress ?? null,
  });
}

export async function unblockUserAccess(input: {
  userId: string;
  adminEmail: string;
  ipAddress?: string | null;
}) {
  const supabase = createAdminClient();

  await Promise.all([
    supabase
      .from('profiles')
      .update({
        is_blocked: false,
        blocked_at: null,
        blocked_reason: null,
      })
      .eq('id', input.userId),
    supabase
      .from('auth_user_blocks')
      .update({
        is_active: false,
        expires_at: new Date().toISOString(),
      })
      .eq('user_id', input.userId),
  ]);

  await logAdminAction({
    adminEmail: input.adminEmail,
    action: 'user.unblock',
    targetType: 'user',
    targetId: input.userId,
    summary: 'Unblocked a user account',
    ipAddress: input.ipAddress ?? null,
  });
}

export async function forceReauthUser(input: {
  userId: string;
  adminEmail: string;
  ipAddress?: string | null;
}) {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  await supabase
    .from('profiles')
    .update({
      force_reauth_after: nowIso,
    })
    .eq('id', input.userId);

  await logAdminAction({
    adminEmail: input.adminEmail,
    action: 'user.force_reauth',
    targetType: 'user',
    targetId: input.userId,
    summary: 'Forced a user to re-authenticate',
    ipAddress: input.ipAddress ?? null,
  });
}

export async function blockIpAddress(input: {
  ipAddress: string;
  adminEmail: string;
  reason?: string | null;
  expiresAt?: string | null;
  requestIp?: string | null;
}) {
  const supabase = createAdminClient();

  await supabase.from('auth_ip_blocks').upsert(
    {
      ip_address: input.ipAddress,
      reason: input.reason ?? null,
      blocked_by: input.adminEmail,
      expires_at: input.expiresAt ?? null,
    },
    { onConflict: 'ip_address' },
  );

  await logAdminAction({
    adminEmail: input.adminEmail,
    action: 'security.block_ip',
    targetType: 'ip',
    targetId: input.ipAddress,
    summary: 'Blocked an IP address',
    details: {
      reason: input.reason ?? null,
      expiresAt: input.expiresAt ?? null,
    },
    ipAddress: input.requestIp ?? null,
  });
}

export async function unblockIpAddress(input: {
  ipAddress: string;
  adminEmail: string;
  requestIp?: string | null;
}) {
  const supabase = createAdminClient();

  await supabase.from('auth_ip_blocks').delete().eq('ip_address', input.ipAddress);

  await logAdminAction({
    adminEmail: input.adminEmail,
    action: 'security.unblock_ip',
    targetType: 'ip',
    targetId: input.ipAddress,
    summary: 'Unblocked an IP address',
    ipAddress: input.requestIp ?? null,
  });
}
