import Redis from "ioredis";

function resolveRedisUrl(): string {
  let raw = (process.env.REDIS_URL || "").trim();
  if (!raw) {
    throw new Error("REDIS_URL is not set");
  }
  // Defensive: strip any stray wrapping quote characters. These keep
  // creeping in when copy-pasting env values into dashboards, and cause
  // a hard-to-spot "%22" suffix in the connection string.
  raw = raw.replace(/^["']+|["']+$/g, "").trim();
  return raw.startsWith("redis://") ? raw.replace("redis://", "rediss://") : raw;
}

const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(resolveRedisUrl());

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export const cacheKeys = {
  postViews: (postId: string) => `post:${postId}:views`,
  post: (postId: string) => `post:${postId}`,
  postList: (page: number) => `posts:list:${page}`,
  trending: "trending",
  rateLimit: (ip: string, route: string) => `ratelimit:${ip}:${route}`,
};

export async function trackView(postId: string) {
  await redis.incr(cacheKeys.postViews(postId));
  await redis.zincrby(cacheKeys.trending, 1, postId);
}

export async function getViewCount(postId: string): Promise<number> {
  const val = await redis.get(cacheKeys.postViews(postId));
  return val ? parseInt(val, 10) : 0;
}

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