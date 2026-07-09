import Link from "next/link";

interface PostCardProps {
  slug: string;
  title: string;
  excerpt?: string | null;
  authorName?: string | null;
  createdAt: string | Date;
  commentCount: number;
  ratingCount: number;
  index: number;
}

export default function PostCard({
  slug,
  title,
  excerpt,
  authorName,
  createdAt,
  commentCount,
  ratingCount,
  index,
}: PostCardProps) {
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/post/${slug}`}
      className="card fade-up"
      style={{
        display: "block",
        padding: 24,
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 70}ms`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "var(--gradient-signature)",
        }}
      />
      <p className="eyebrow" style={{ marginBottom: 12 }}>
        {date} · {authorName ?? "Anonymous"}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.3rem",
          fontWeight: 700,
          margin: "0 0 10px",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      {excerpt && (
        <p style={{ color: "var(--text-dim)", fontSize: "0.95rem", margin: "0 0 18px" }}>
          {excerpt}
        </p>
      )}
      <div
        style={{
          display: "flex",
          gap: 16,
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          color: "var(--text-faint)",
        }}
      >
        <span>💬 {commentCount}</span>
        <span>🔥 {ratingCount}</span>
      </div>
    </Link>
  );
}
