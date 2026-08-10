"use client";

import { useState, useTransition } from "react";
import { loginWithPin } from "./actions";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    setError("");
    startTransition(async () => {
      const res = await loginWithPin(pin);
      if (res?.error) setError(res.error);
    });
  }

  function press(digit: string) {
    if (digit === "back") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length >= 4) {
      // auto-submit once a plausible PIN length is reached, but let people
      // keep typing up to 6 digits before locking in
    }
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <p className="font-display text-3xl font-semibold text-white text-center">Allvet</p>
        <p className="text-white/50 text-sm text-center mt-2 mb-10">Enter your PIN to continue</p>

        <div className="flex justify-center gap-3 mb-8" aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full border border-white/30 ${
                i < pin.length ? "bg-mint border-mint" : ""
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-[#ff8a80] mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((d, i) =>
            d === "" ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => press(d)}
                disabled={pending}
                aria-label={d === "back" ? "Delete" : `Digit ${d}`}
                className="h-16 rounded-2xl bg-white/5 text-white text-xl font-medium active:bg-white/15 transition-colors disabled:opacity-40"
              >
                {d === "back" ? "⌫" : d}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={pin.length < 4 || pending}
          className="w-full mt-6 h-12 rounded-xl bg-mint text-ink font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
      </div>
    </div>
  );
}
