import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis, cacheKeys } from "@/lib/redis";
import { authOptions } from "@/lib/auth";
import { siteConfig } from "@/config/site.config";

// GET /api/posts?page=1  — public, cached
export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
  const cacheKey = cacheKeys.postList(page);

  // 1. Try the cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  // 2. Cache miss — read from Postgres
  const perPage = siteConfig.theme.postsPerPage;
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      createdAt: true,
      author: { select: { name: true } },
      _count: { select: { comments: true, ratings: true } },
    },
  });

  const result = { posts, page };

  // 3. Populate the cache for next time
  await redis.set(cacheKey, JSON.stringify(result), "EX", siteConfig.cache.postListTtlSeconds);

  return NextResponse.json(result);
}

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "slug must be lowercase, hyphenated"),
  content: z.string().min(1),
  excerpt: z.string().max(300).optional(),
  published: z.boolean().optional(),
});

// POST /api/posts — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: { ...parsed.data, authorId: session.user.id },
  });

  // New post invalidates cached first page so it shows up immediately
  await redis.del(cacheKeys.postList(1));

  return NextResponse.json({ post }, { status: 201 });
}
