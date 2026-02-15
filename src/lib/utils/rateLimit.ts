/**
 * In-memory rate limiter for server actions.
 * Uses a sliding window approach per user ID.
 *
 * In production with multiple Vercel instances, each instance
 * has its own memory, so this provides per-instance limiting.
 * For stricter limits, use Supabase or Upstash Redis.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  const keys = Array.from(store.keys());
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const entry = store.get(key);
    if (!entry) continue;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

/**
 * Check if a request is allowed under the rate limit.
 *
 * @param key - Unique identifier (e.g. `post:${userId}`)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
  };
}

// Preset limits
export const RATE_LIMITS = {
  /** New users (< 24h old): 3 posts per hour */
  NEW_USER_POST: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  /** Regular users: 20 posts per hour */
  POST: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  /** Thread creation: 5 per hour */
  THREAD: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  /** Photo uploads: 30 per hour */
  PHOTO_UPLOAD: { maxRequests: 30, windowMs: 60 * 60 * 1000 },
  /** Reports: 10 per hour */
  REPORT: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  /** Password changes: 3 per hour */
  PASSWORD_CHANGE: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  /** Search: 30 per minute */
  SEARCH: { maxRequests: 30, windowMs: 60 * 1000 },
} as const;
