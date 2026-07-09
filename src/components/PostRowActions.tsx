"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostRowActions({
  postId,
  published,
}: {
  postId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    setLoading(true);
    await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deletePost() {
    if (!confirm("Delete this post permanently? This can't be undone.")) return;
    setLoading(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={togglePublish}
        disabled={loading}
        className="btn btn-ghost"
        style={{ padding: "8px 14px", fontSize: "0.82rem" }}
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={deletePost}
        disabled={loading}
        className="btn btn-ghost"
        style={{ padding: "8px 14px", fontSize: "0.82rem", borderColor: "var(--orange)", color: "var(--orange)" }}
      >
        Delete 🗑️
      </button>
    </div>
  );
}
