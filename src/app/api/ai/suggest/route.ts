import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { getWritingSuggestions } from "@/lib/ai";
import { checkRateLimit } from "@/lib/redis";
import { authOptions } from "@/lib/auth";
import { siteConfig } from "@/config/site.config";

const suggestSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(20000),
});

// POST /api/ai/suggest — admin only (this powers the "review draft" button
// in the post editor, not a public feature)
export async function POST(req: NextRequest) {
  if (!siteConfig.features.aiSuggestions) {
    return NextResponse.json({ error: "AI suggestions are disabled" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // AI calls cost money per request — rate limit more strictly than comments
  const allowed = await checkRateLimit(session.user.id, "ai-suggest", 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests, try again shortly" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = suggestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const suggestions = await getWritingSuggestions(parsed.data.title, parsed.data.content);

  return NextResponse.json({ suggestions });
}
