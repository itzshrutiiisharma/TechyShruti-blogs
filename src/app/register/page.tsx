"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] || data.error || "Couldn't create that account");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
    } else {
      const session = await fetch("/api/auth/session").then((r) => r.json());
      router.push(session?.user?.role === "ADMIN" ? "/dashboard" : "/");
      router.refresh();
    }
  }

  return (
    <main style={{ position: "relative", minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <AnimatedBackground />
      <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
        <div className="card fade-up" style={{ padding: 36 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            join the discussion
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", margin: "0 0 28px" }}>
            Create account <span className="gradient-text">🚀</span>
          </h1>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
            />
            {error && <p style={{ color: "var(--orange)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: "center" }}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: "0.85rem", color: "var(--text-faint)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--pink)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg-alt)",
  color: "var(--text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
};
