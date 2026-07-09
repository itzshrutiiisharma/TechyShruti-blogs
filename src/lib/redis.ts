import Redis from "ioredis";

function resolveRedisUrl(): string {
  const raw = (process.env.REDIS_URL || "").trim();
  if (!raw) {
    throw new Error("REDIS_URL is not set");
  }
  // Upstash (and most managed Redis providers) require TLS. If someone
  // copies the plain redis:// form by mistake, upgrade it automatically
  // rather than failing at connection time.
  return raw.startsWith("redis://") ? raw.replace("redis://", "rediss://") : raw;
}

const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(resolveRedisUrl());

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// ---- Key naming conventions ----
// post:{id}:views          -> integer counter, incremented on every read
// post:{id}                -> cached JSON of a single post
// posts:list:{page}        -> cached JSON of a paginated post list
// trending                 -> sorted set, score = view count, used for "popular posts"
// ratelimit:{ip}:{route}   -> integer counter with TTL, used for basic abuse protection

export const cacheKeys = {
  postViews: (postId: string) => `post:${postId}:views`,
  post: (postId: string) => `post:${postId}`,
  postList: (page: number) => `posts:list:${page}`,
  trending: "trending",
  rateLimit: (ip: string, route: string) => `ratelimit:${ip}:${route}`,
};

// Cache-aside pattern: increment the view counter in Redis (fast, no DB write).
// A separate scheduled job (see scripts/sync-views.ts) periodically flushes
// these counters into Postgres so the numbers aren't lost on Redis restart.
export async function trackView(postId: string) {
  await redis.incr(cacheKeys.postViews(postId));
  await redis.zincrby(cacheKeys.trending, 1, postId);
}

export async function getViewCount(postId: string): Promise<number> {
  const val = await redis.get(cacheKeys.postViews(postId));
  return val ? parseInt(val, 10) : 0;
}

// Simple fixed-window rate limiter: max N requests per window per IP+route.
export async function checkRateLimit(
  ip: string,
  route: string,
  limit = 10,
  windowSeconds = 60
): Promise<boolean> {
  const key = cacheKeys.rateLimit(ip, route);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count <= limit;
}
