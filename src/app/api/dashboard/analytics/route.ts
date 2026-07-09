import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redis, getViewCount, cacheKeys } from "@/lib/redis";
import { authOptions } from "@/lib/auth";

// GET /api/dashboard/analytics — admin only
// Combines Postgres (comment/rating counts) with Redis (live view counts)
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      createdAt: true,
      _count: { select: { comments: true, ratings: true } },
      ratings: { select: { value: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Live view counts come from Redis, not Postgres — they're the freshest
  // number available, updated on every single page read.
  const analytics = await Promise.all(
    posts.map(async (post) => {
      const views = await getViewCount(post.id);
      const avgRating =
        post.ratings.length > 0
          ? post.ratings.reduce((sum, r) => sum + r.value, 0) / post.ratings.length
          : 0;

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        published: post.published,
        views,
        comments: post._count.comments,
        ratingCount: post._count.ratings,
        averageRating: Math.round(avgRating * 10) / 10,
      };
    })
  );

  // Trending list: top 5 posts by view count, straight from the Redis sorted set
  const trending = await redis.zrevrange(cacheKeys.trending, 0, 4, "WITHSCORES");

  return NextResponse.json({ posts: analytics, trending });
}
