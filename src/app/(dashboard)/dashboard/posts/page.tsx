import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getViewCount } from "@/lib/redis";
import PostRowActions from "@/components/PostRowActions";

export default async function AllPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      createdAt: true,
      _count: { select: { comments: true, ratings: true } },
    },
  });

  const rows = await Promise.all(
    posts.map(async (post) => ({ ...post, views: await getViewCount(post.id) }))
  );

  return (
    <main className="container" style={{ padding: "40px 24px 100px", maxWidth: 960 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>
            manage everything you&apos;ve written
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", margin: 0 }}>
            All posts <span className="gradient-text">🗂️</span>
          </h1>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          Write a post ✍️
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>
          <p style={{ fontSize: "1.8rem", marginBottom: 8 }}>📭</p>
          <p>Nothing here yet — write your first post.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((post) => (
            <div
              key={post.id}
              className="card"
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <Link
                  href={`/post/${post.slug}`}
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {post.title}
                </Link>{" "}
                <span
                  className="eyebrow"
                  style={{ color: post.published ? "var(--mint)" : "var(--orange)" }}
                >
                  {post.published ? "● published" : "● draft"}
                </span>
                <p className="eyebrow" style={{ marginTop: 4 }}>
                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·
                  👀 {post.views} · 💬 {post._count.comments} · 🔥 {post._count.ratings}
                </p>
              </div>
              <PostRowActions postId={post.id} published={post.published} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
