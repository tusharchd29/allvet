"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Auto-logout after 5 minutes of no interaction — this app is PIN-session
// based with a 30-day cookie, and reps use shared/handheld devices in the
// field, so a screen left open and unattended shouldn't stay signed in
// indefinitely. Any of these events counts as activity and resets the
// clock; a background check (not a single setTimeout) means the timer
// still fires correctly even if the tab was backgrounded/throttled.
const IDLE_LIMIT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 10_000;
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "wheel"] as const;

export function IdleLogout() {
  const router = useRouter();
  // Seeded from an effect, not at render time — Date.now() is impure and
  // React can re-invoke a render, which would silently push the deadline
  // back on every re-render if it were called inline here.
  const lastActivityRef = useRef<number | null>(null);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    function markActive() {
      lastActivityRef.current = Date.now();
    }
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }));

    const interval = setInterval(async () => {
      if (lastActivityRef.current === null || Date.now() - lastActivityRef.current < IDLE_LIMIT_MS) return;
      clearInterval(interval);
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch {
        // Best-effort — fall through to the redirect either way so the
        // screen doesn't just sit there if the request failed offline.
      }
      router.replace("/login?reason=idle");
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActive));
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
