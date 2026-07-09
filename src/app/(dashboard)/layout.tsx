import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardSignOut from "@/components/DashboardSignOut";

// This is the single gatekeeper for every /dashboard/* route. It runs as a
// normal server component (Node.js runtime), not Edge middleware — the
// same runtime that already proved reliable for reading session/role.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 68px)" }}>
      {/* ---------- Sidebar ---------- */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: "28px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <p className="eyebrow" style={{ padding: "0 12px", marginBottom: 12 }}>
          control room
        </p>
        <SidebarLink href="/dashboard" emoji="📊" label="Overview" />
        <SidebarLink href="/dashboard/posts" emoji="🗂️" label="All posts" />
        <SidebarLink href="/dashboard/new" emoji="✍️" label="Write new" />

        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <p style={{ padding: "0 12px", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: 4 }}>
            {session.user.name}
          </p>
          <p className="eyebrow" style={{ padding: "0 12px", marginBottom: 12, color: "var(--mint)" }}>
            🛡️ admin
          </p>
          <DashboardSignOut />
        </div>
      </aside>

      {/* ---------- Page content ---------- */}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function SidebarLink({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        color: "var(--text-dim)",
        fontSize: "0.92rem",
        fontFamily: "var(--font-display)",
        fontWeight: 500,
        transition: "background 0.15s ease, color 0.15s ease",
      }}
      className="sidebar-link"
    >
      <span>{emoji}</span>
      {label}
    </Link>
  );
}
