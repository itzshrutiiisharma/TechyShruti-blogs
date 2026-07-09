import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis, cacheKeys } from "@/lib/redis";
import { authOptions } from "@/lib/auth";

const ratingSchema = z.object({
  value: z.number().int().min(1).max(5),
});

// PUT /api/posts/:id/rating — logged-in readers only, upserts on repeat rating
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Sign in to rate" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // The @@unique([postId, userId]) constraint in the schema makes this a
  // true upsert — re-rating a post updates the existing row instead of
  // creating a duplicate.
  const rating = await prisma.rating.upsert({
    where: { postId_userId: { postId: id, userId: session.user.id } },
    update: { value: parsed.data.value },
    create: { postId: id, userId: session.user.id, value: parsed.data.value },
  });

  await redis.del(cacheKeys.post(id));

  const agg = await prisma.rating.aggregate({
    where: { postId: id },
    _avg: { value: true },
    _count: true,
  });

  return NextResponse.json({
    rating,
    average: agg._avg.value ?? 0,
    count: agg._count,
  });
}
