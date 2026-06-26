import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate-limit serverless via Upstash com fallback no-op.
 *
 * Em ambiente sem `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`
 * (dev local sem credencial, CI), o helper retorna sempre `success: true`
 * — assim o fluxo continua funcional, e a defesa real só ativa em
 * produção, onde os envs estarão presentes.
 *
 * Cada chave (`leads:newsletter`, `leads:isca`, `auth:login`...) declara
 * sua janela e teto. A função aceita identificador (IP ou e-mail) e
 * retorna `{ success, limit, remaining, reset }`.
 */

let cachedRedis: Redis | null = null;

function getRedis(): Redis | null {
  if (cachedRedis) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

const limiterCache = new Map<string, Ratelimit>();

type Window =
  | `${number} ms`
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

function getLimiter(
  prefix: string,
  max: number,
  window: Window,
): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${prefix}|${max}|${window}`;
  const cached = limiterCache.get(key);
  if (cached) return cached;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
    analytics: false,
  });
  limiterCache.set(key, limiter);
  return limiter;
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  skipped?: true;
};

export async function rateLimit(opts: {
  prefix: string;
  max: number;
  window: Window;
  key: string;
}): Promise<RateLimitResult> {
  const limiter = getLimiter(opts.prefix, opts.max, opts.window);
  if (!limiter) {
    return {
      success: true,
      limit: opts.max,
      remaining: opts.max,
      reset: Date.now() + 60_000,
      skipped: true,
    };
  }
  const result = await limiter.limit(opts.key);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
