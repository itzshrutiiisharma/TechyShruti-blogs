"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Wrong email or password");
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
            welcome back
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              margin: "0 0 28px",
            }}
          >
            Sign in <span className="gradient-text">✨</span>
          </h1>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            {error && <p style={{ color: "var(--orange)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: "center" }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: "0.85rem", color: "var(--text-faint)" }}>
            No account yet?{" "}
            <Link href="/register" style={{ color: "var(--pink)" }}>
              Register here
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
