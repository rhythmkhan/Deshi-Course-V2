type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const RATE_LIMIT_SWEEP_INTERVAL_MS = 60_000;

function getStore() {
  const globalState = globalThis as typeof globalThis & {
    __deshicourseRateLimitStore?: Map<string, RateLimitEntry>;
    __deshicourseRateLimitSweepAt?: number;
  };

  if (!globalState.__deshicourseRateLimitStore) {
    globalState.__deshicourseRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalState;
}

function sweepExpiredEntries(now: number) {
  const state = getStore();
  const nextSweepAt = state.__deshicourseRateLimitSweepAt ?? 0;

  if (nextSweepAt > now) {
    return;
  }

  for (const [key, entry] of state.__deshicourseRateLimitStore!.entries()) {
    if (entry.resetAt <= now) {
      state.__deshicourseRateLimitStore!.delete(key);
    }
  }

  state.__deshicourseRateLimitSweepAt = now + RATE_LIMIT_SWEEP_INTERVAL_MS;
}

export function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-client-ip') ||
    'unknown'
  );
}

export function rateLimitByKey({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const state = getStore();
  const store = state.__deshicourseRateLimitStore!;

  sweepExpiredEntries(now);

  const currentEntry = store.get(key);
  const entry =
    currentEntry && currentEntry.resetAt > now
      ? currentEntry
      : {
          count: 0,
          resetAt: now + windowMs,
        };

  entry.count += 1;
  store.set(key, entry);

  return {
    ok: entry.count <= limit,
    remaining: Math.max(limit - entry.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((entry.resetAt - now) / 1000), 1),
  };
}
