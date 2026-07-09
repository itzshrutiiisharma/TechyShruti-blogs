"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string | null };
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSubmitting(false);

    if (res.ok) {
      const data = await res.json();
      setComments([data.comment, ...comments]);
      setContent("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Couldn't post that comment");
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: 20 }}>
        💬 {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h3>

      {session ? (
        <form onSubmit={submit} style={{ marginBottom: 32 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            {error && <span style={{ color: "var(--orange)", fontSize: "0.85rem" }}>{error}</span>}
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginLeft: "auto" }}>
              {submitting ? "Posting…" : "Post comment ✍️"}
            </button>
          </div>
        </form>
      ) : (
        <p
          className="card"
          style={{ padding: 16, marginBottom: 32, color: "var(--text-dim)", fontSize: "0.9rem" }}
        >
          <Link href="/login" style={{ color: "var(--pink)" }}>
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {comments.map((c) => (
          <div key={c.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem" }}>
                {c.user.name ?? "Anonymous"}
              </span>
              <span className="eyebrow">
                {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <p style={{ margin: 0, color: "var(--text-dim)", fontSize: "0.92rem" }}>{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
