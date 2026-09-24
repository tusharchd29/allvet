"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { loginWithPin } from "./actions";

function IdleNotice() {
  const params = useSearchParams();
  if (params.get("reason") !== "idle") return null;
  return (
    <p className="text-sm text-[var(--warn)] text-center mb-4 -mt-4">
      Signed out after 5 minutes of inactivity.
    </p>
  );
}

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function press(digit: string) {
    setError(null);
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      startTransition(async () => {
        const result = await loginWithPin(next);
        if (result && !result.ok) {
          setError(result.message);
          setPin("");
        }
      });
    }
  }

  function backspace() {
    setError(null);
    setPin((p) => p.slice(0, -1));
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[var(--offwhite)]">
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--teal)] flex items-center justify-center text-white text-xl font-bold mb-4">
            AV
          </div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">Allvet</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Enter your 4-digit PIN
          </p>
        </div>

        <Suspense fallback={null}>
          <IdleNotice />
        </Suspense>

        <div className="flex justify-center gap-3 mb-2" aria-live="polite">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg font-semibold ${
                i < pin.length
                  ? "border-[var(--teal)] bg-white text-[var(--ink)]"
                  : "border-[var(--border)] bg-white text-transparent"
              }`}
            >
              {i < pin.length ? "•" : "0"}
            </div>
          ))}
        </div>

        <div className="h-6 text-center text-sm text-[var(--danger)] mb-4">
          {pending ? "Checking…" : error}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              disabled={pending}
              onClick={() => press(d)}
              className="btn-secondary h-14 text-lg"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            type="button"
            disabled={pending}
            onClick={() => press("0")}
            className="btn-secondary h-14 text-lg"
          >
            0
          </button>
          <button
            type="button"
            disabled={pending || pin.length === 0}
            onClick={backspace}
            className="btn-secondary h-14 text-lg"
            aria-label="Backspace"
          >
            ⌫
          </button>
        </div>
      </div>
    </main>
  );
}
