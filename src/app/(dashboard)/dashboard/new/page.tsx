"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  type: "clarity" | "grammar" | "structure" | "seo";
  original: string;
  suggestion: string;
  reason: string;
}

const TYPE_EMOJI: Record<Suggestion["type"], string> = {
  clarity: "💡",
  grammar: "✏️",
  structure: "🧱",
  seo: "🔍",
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reviewDraft() {
    if (!title.trim() || !content.trim()) {
      setError("Add a title and some content first");
      return;
    }
    setError(null);
    setReviewing(true);
    setSuggestions([]);

    const res = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setReviewing(false);

    if (res.ok) {
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } else {
      setError("Couldn't get suggestions right now");
    }
  }

  async function publish(published: boolean) {
    if (!title.trim() || !content.trim()) {
      setError("Add a title and some content first");
      return;
    }
    setPublishing(true);
    setError(null);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slugify(title),
        excerpt: excerpt || undefined,
        content,
        published,
      }),
    });

    setPublishing(false);

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] || "Couldn't save that post");
    }
  }

  return (
    <main className="container" style={{ padding: "48px 24px 100px" }}>
      <p className="eyebrow" style={{ marginBottom: 6 }}>
        new draft
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", margin: "0 0 32px" }}>
        Write a post <span className="gradient-text">✍️</span>
      </h1>

      <div className="editor-grid">
        {/* ---------- Editor ---------- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...inputStyle, fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600 }}
          />
          <input
            placeholder="Short excerpt (optional, shown on the feed)"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Write your post… markdown-style plain text works great."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />

          {error && <p style={{ color: "var(--orange)", fontSize: "0.85rem" }}>{error}</p>}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={reviewDraft} disabled={reviewing} className="btn btn-ghost">
              {reviewing ? "Thinking…" : "Review with AI 🤖"}
            </button>
            <button onClick={() => publish(false)} disabled={publishing} className="btn btn-ghost">
              Save draft 💾
            </button>
            <button onClick={() => publish(true)} disabled={publishing} className="btn btn-primary">
              {publishing ? "Publishing…" : "Publish 🚀"}
            </button>
          </div>
        </div>

        {/* ---------- AI suggestions panel ---------- */}
        <aside>
          <div
            className="card"
            style={{ padding: 20, position: "sticky", top: 88, minHeight: 200 }}
          >
            <p className="eyebrow" style={{ marginBottom: 12 }}>
              🤖 AI suggestions
            </p>

            {reviewing && (
              <p style={{ color: "var(--text-faint)", fontSize: "0.9rem" }}>
                Reading your draft…
              </p>
            )}

            {!reviewing && suggestions.length === 0 && (
              <p style={{ color: "var(--text-faint)", fontSize: "0.9rem" }}>
                Click &quot;Review with AI&quot; to get feedback on clarity, grammar, and
                structure before you publish.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "var(--bg-alt)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p className="eyebrow" style={{ marginBottom: 6 }}>
                    {TYPE_EMOJI[s.type]} {s.type}
                  </p>
                  <p style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "var(--text-faint)", fontStyle: "italic" }}>
                    &quot;{s.original}&quot;
                  </p>
                  <p style={{ margin: "0 0 6px", fontSize: "0.9rem" }}>→ {s.suggestion}</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-faint)" }}>{s.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
  width: "100%",
};
