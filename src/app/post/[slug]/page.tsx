import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { trackView, getViewCount } from "@/lib/redis";
import EmojiRating from "@/components/EmojiRating";
import CommentSection from "@/components/CommentSection";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      ratings: true,
    },
  });

  if (!post || !post.published) notFound();

  await trackView(post.id);
  const views = await getViewCount(post.id);

  const avgRating =
    post.ratings.length > 0
      ? post.ratings.reduce((sum, r) => sum + r.value, 0) / post.ratings.length
      : 0;

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="container" style={{ maxWidth: 760, padding: "60px 24px 100px" }}>
      <p className="eyebrow fade-up" style={{ marginBottom: 16 }}>
        {date} · {post.author.name ?? "Anonymous"} · 👀 {views} views
      </p>
      <h1
        className="fade-up"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          lineHeight: 1.1,
          margin: "0 0 32px",
        }}
      >
        {post.title}
      </h1>

      <div
        className="fade-up"
        style={{
          color: "var(--text-dim)",
          fontSize: "1.05rem",
          whiteSpace: "pre-wrap",
          marginBottom: 48,
        }}
      >
        {post.content}
      </div>

      <div style={{ marginBottom: 48 }}>
        <EmojiRating postId={post.id} initialAverage={avgRating} initialCount={post.ratings.length} />
      </div>

      <CommentSection postId={post.id} initialComments={post.comments as any} />
    </main>
  );
}
