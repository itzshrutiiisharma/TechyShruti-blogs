"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const REACTIONS = [
  { value: 1, emoji: "😐", label: "meh" },
  { value: 2, emoji: "🙂", label: "decent" },
  { value: 3, emoji: "😀", label: "good" },
  { value: 4, emoji: "🤩", label: "great" },
  { value: 5, emoji: "🔥", label: "fire" },
];

export default function EmojiRating({
  postId,
  initialAverage,
  initialCount,
}: {
  postId: string;
  initialAverage: number;
  initialCount: number;
}) {
  const { data: session } = useSession();
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [selected, setSelected] = useState<number | null>(null);
  const [poppingValue, setPoppingValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function react(value: number) {
    if (!session) {
      setError("Sign in to react");
      return;
    }
    setError(null);
    setSelected(value);
    setPoppingValue(value);
    setTimeout(() => setPoppingValue(null), 350);

    const res = await fetch(`/api/posts/${postId}/rating`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });

    if (res.ok) {
      const data = await res.json();
      setAverage(data.average);
      setCount(data.count);
    } else {
      setError("Couldn't save that — try again");
    }
  }

  return (
    <div
      className="card"
      style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div>
        <p className="eyebrow" style={{ marginBottom: 6 }}>
          How was this post?
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {REACTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => react(r.value)}
              title={r.label}
              aria-label={`Rate ${r.label}`}
              className={poppingValue === r.value ? "pop" : ""}
              style={{
                fontSize: "1.6rem",
                background: selected === r.value ? "var(--surface-hover)" : "transparent",
                border: selected === r.value ? "1px solid var(--pink)" : "1px solid transparent",
                borderRadius: 12,
                padding: "6px 10px",
                lineHeight: 1,
                transition: "transform 0.15s ease, background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2) translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) translateY(0)")}
            >
              {r.emoji}
            </button>
          ))}
        </div>
        {error && (
          <p style={{ color: "var(--orange)", fontSize: "0.8rem", marginTop: 6 }}>{error}</p>
        )}
      </div>

      <div style={{ textAlign: "right" }}>
        <p
          className="gradient-text"
          style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}
        >
          {average.toFixed(1)}
        </p>
        <p style={{ color: "var(--text-faint)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
          {count} {count === 1 ? "reaction" : "reactions"}
        </p>
      </div>
    </div>
  );
}
