"use client";

import { signOut } from "next-auth/react";

export default function DashboardSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn btn-ghost"
      style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "8px 12px" }}
    >
      Sign out 👋
    </button>
  );
}
