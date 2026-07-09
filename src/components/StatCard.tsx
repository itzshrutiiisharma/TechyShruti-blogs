"use client";

import { useEffect, useState } from "react";

export default function StatCard({
  label,
  value,
  emoji,
  suffix = "",
}: {
  label: string;
  value: number;
  emoji: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="card" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
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
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        {emoji} {label}
      </p>
      <p
        className="gradient-text"
        style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 700, margin: 0 }}
      >
        {display}
        {suffix}
      </p>
    </div>
  );
}
