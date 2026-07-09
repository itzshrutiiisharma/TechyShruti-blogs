import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getViewCount, redis, cacheKeys } from "@/lib/redis";
import StatCard from "@/components/StatCard";

export default async function DashboardPage() {
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
      ratings: { select: { value: true } },
    },
  });

  const rows = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      views: await getViewCount(post.id),
      avgRating:
        post.ratings.length > 0
          ? post.ratings.reduce((s, r) => s + r.value, 0) / post.ratings.length
          : 0,
    }))
  );

  const totalViews = rows.reduce((sum, p) => sum + p.views, 0);
  const totalComments = rows.reduce((sum, p) => sum + p._count.comments, 0);
  const totalReactions = rows.reduce((sum, p) => sum + p._count.ratings, 0);

  const trendingRaw = await redis.zrevrange(cacheKeys.trending, 0, 2);

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
            welcome back, {session.user.name?.split(" ")[0]}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", margin: 0 }}>
            Overview <span className="gradient-text">📊</span>
          </h1>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          Write a post ✍️
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <StatCard label="Total reach" value={totalViews} emoji="👀" />
        <StatCard label="Comments" value={totalComments} emoji="💬" />
        <StatCard label="Reactions" value={totalReactions} emoji="🔥" />
        <StatCard label="Published posts" value={rows.filter((r) => r.published).length} emoji="📝" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: 0 }}>
          Recent posts
        </h2>
        <Link href="/dashboard/posts" style={{ color: "var(--pink)", fontSize: "0.85rem" }}>
          View all →
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>
          <p style={{ fontSize: "1.8rem", marginBottom: 8 }}>✍️</p>
          <p>Nothing published yet — write your first post to see analytics here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.slice(0, 5).map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="card"
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, margin: 0 }}>
                  {post.title}{" "}
                  {!post.published && (
                    <span className="eyebrow" style={{ color: "var(--orange)" }}>
                      (draft)
                    </span>
                  )}
                </p>
                <p className="eyebrow" style={{ marginTop: 4 }}>
                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                }}
              >
                <span>👀 {post.views}</span>
                <span>💬 {post._count.comments}</span>
                <span>🔥 {post.avgRating.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {trendingRaw.length > 0 && (
        <p style={{ marginTop: 28, color: "var(--text-faint)", fontSize: "0.85rem" }}>
          📈 Trending post IDs (by live views): {trendingRaw.join(", ")}
        </p>
      )}
    </main>
  );
}
