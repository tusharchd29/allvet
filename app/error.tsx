"use client";

import { useEffect } from "react";

/**
 * Root-level backstop, for anything that throws outside the `(app)` route
 * group (login page, or a crash in the `(app)` layout itself before its own
 * error.tsx can take over). Deliberately plain/inline-styled rather than
 * depending on app components, since a root-layout-level failure is
 * precisely the case where those might not be safe to render either.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "24px",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: "16px" }}>Something went wrong</div>
      <p style={{ color: "#6b7c79", fontSize: "14px", maxWidth: "320px" }}>
        Check your connection and try again.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            background: "#028090",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Try again
        </button>
        <a
          href="/login"
          style={{
            background: "#f1f5f4",
            color: "#0b3d3a",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Back to login
        </a>
      </div>
    </div>
  );
}
