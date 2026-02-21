/**
 * Sliding-window rate limiter middleware for Hono.
 *
 * Tracks write-operation (POST/PUT/DELETE) timestamps in memory and
 * returns 429 when the limit is exceeded within the window.
 *
 * Also supports a force-enable flag (via `isForceEnabled`) so the
 * test endpoints can toggle 429 responses for integration testing.
 */
import type { Context, Next } from 'hono';

interface RateLimiterOptions {
  /** Time window in milliseconds (default: 60 000 = 1 minute) */
  windowMs?: number;
  /** Max write requests allowed per window (default: 60) */
  maxRequests?: number;
  /** When this returns true, every write request gets 429 (test toggle) */
  isForceEnabled?: () => boolean;
}

export function createCrudRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 60;
  const timestamps: number[] = [];

  return async (c: Context, next: Next) => {
    // Only rate-limit write operations
    if (c.req.method === 'GET') {
      return next();
    }

    // Test toggle: force 429 for all writes
    if (options.isForceEnabled?.()) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    const now = Date.now();
    // Evict timestamps outside the window
    while (timestamps.length > 0 && timestamps[0]! <= now - windowMs) {
      timestamps.shift();
    }

    if (timestamps.length >= maxRequests) {
      return c.json({ error: 'Rate limit exceeded. Too many write operations.' }, 429);
    }

    timestamps.push(now);
    return next();
  };
}
