"use client";

import { useEffect } from "react";
import { Card } from "@/components/Card";

/**
 * Backstop for anything that still throws uncaught inside an `(app)` page
 * (a Server Component render error, a bug in a client effect — not the
 * create-form path, which ActionForm now catches inline). Without this,
 * Next's default error page replaces the whole screen and drops the
 * sidebar/nav; this keeps the app shell (see the layout in this route
 * group) and gives a one-tap way back instead of a dead end.
 */
export default function AppError({
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
    <Card className="text-center py-8">
      <div className="font-medium text-[var(--ink)] mb-1">Something went wrong</div>
      <p className="text-sm text-[var(--muted)] mb-4">
        This usually clears up on a retry — check your connection and try again.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary px-4 py-2 text-sm">
          Try again
        </button>
        <a href="/dashboard" className="btn-secondary px-4 py-2 text-sm">
          Go to dashboard
        </a>
      </div>
    </Card>
  );
}
