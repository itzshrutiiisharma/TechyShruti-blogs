"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { siteConfig } from "@/config/site.config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(14px)",
        background: scrolled ? "rgba(11,13,23,0.85)" : "rgba(11,13,23,0.4)",
        transition: "background 0.25s ease",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.15rem",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span className="gradient-text">{siteConfig.name}</span>
          <span className="cursor" style={{ height: "1.1em" }} />
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
            Posts
          </Link>

          {session?.user?.role === "ADMIN" ? (
            <>
              <Link href="/dashboard" style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-ghost"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Sign out 👋
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
              Sign in ✨
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
