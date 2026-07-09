import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis, cacheKeys } from "@/lib/redis";
import { checkRateLimit } from "@/lib/redis";
import { authOptions } from "@/lib/auth";

// GET /api/posts/:id/comments — public
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ comments });
}

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// POST /api/posts/:id/comments — logged-in readers only
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
  }

  // Basic abuse protection: max 5 comments per minute per user
  const allowed = await checkRateLimit(session.user.id, "comments", 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many comments, slow down" }, { status: 429 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId: id,
      userId: session.user.id,
    },
    include: { user: { select: { name: true } } },
  });

  // The cached single-post payload includes comments — invalidate it
  await redis.del(cacheKeys.post(id));

  return NextResponse.json({ comment }, { status: 201 });
}
