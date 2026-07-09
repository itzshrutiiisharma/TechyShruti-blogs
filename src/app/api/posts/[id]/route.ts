import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis, cacheKeys, trackView, getViewCount } from "@/lib/redis";
import { authOptions } from "@/lib/auth";
import { siteConfig } from "@/config/site.config";

// GET /api/posts/:id — public, cached, increments the Redis view counter
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Every real view increments Redis — cheap, no DB write on the hot path
  await trackView(id);

  const cached = await redis.get(cacheKeys.post(id));
  if (cached) {
    const post = JSON.parse(cached);
    return NextResponse.json({ post, views: await getViewCount(id) });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      ratings: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await redis.set(cacheKeys.post(id), JSON.stringify(post), "EX", siteConfig.cache.postTtlSeconds);

  return NextResponse.json({ post, views: await getViewCount(id) });
}

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(300).optional(),
  published: z.boolean().optional(),
});

// PATCH /api/posts/:id — admin only
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.post.update({
    where: { id },
    data: parsed.data,
  });

  // Stale cache would show the old content — invalidate on every edit
  await redis.del(cacheKeys.post(id));
  await redis.del(cacheKeys.postList(1));

  return NextResponse.json({ post });
}

// DELETE /api/posts/:id — admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  await redis.del(cacheKeys.post(id));
  await redis.del(cacheKeys.postList(1));

  return NextResponse.json({ success: true });
}
