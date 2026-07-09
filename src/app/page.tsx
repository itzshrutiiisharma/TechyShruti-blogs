import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site.config";
import AnimatedBackground from "@/components/AnimatedBackground";
import PostCard from "@/components/PostCard";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: siteConfig.theme.postsPerPage,
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

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section style={{ position: "relative", overflow: "hidden", padding: "100px 0 80px" }}>
        <AnimatedBackground />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <p className="eyebrow fade-up" style={{ marginBottom: 18 }}>
            👋 welcome to the notebook
          </p>
          <h1
            className="fade-up"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              lineHeight: 1.05,
              margin: "0 0 20px",
              animationDelay: "80ms",
            }}
          >
            <span className="gradient-text">{siteConfig.name}</span>
            <span className="cursor" style={{ height: "0.85em", marginLeft: 4 }} />
          </h1>
          <p
            className="fade-up"
            style={{
              color: "var(--text-dim)",
              fontSize: "1.15rem",
              maxWidth: 560,
              margin: "0 auto 36px",
              animationDelay: "160ms",
            }}
          >
            {siteConfig.tagline}. Real notes on building things — react, reload, repeat. 🚀
          </p>
          <div
            className="fade-up"
            style={{ display: "flex", gap: 14, justifyContent: "center", animationDelay: "240ms" }}
          >
            <a href="#feed" className="btn btn-primary">
              Start reading ↓
            </a>
            <a href="/register" className="btn btn-ghost">
              Join the discussion 💬
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Feed ---------- */}
      <section id="feed" className="container" style={{ paddingBottom: 100 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", margin: 0 }}>
            Latest posts
          </h2>
          <span className="eyebrow">{posts.length} published</span>
        </div>

        {posts.length === 0 ? (
          <div
            className="card"
            style={{ padding: 48, textAlign: "center", color: "var(--text-dim)" }}
          >
            <p style={{ fontSize: "2rem", marginBottom: 8 }}>📭</p>
            <p>No posts yet. Once you publish from the dashboard, they&apos;ll show up here.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                authorName={post.author?.name}
                createdAt={post.createdAt}
                commentCount={post._count.comments}
                ratingCount={post._count.ratings}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
