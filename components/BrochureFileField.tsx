"use client";

import { useState } from "react";
import { useActionFormPending } from "./ActionForm";

/** Same rationale as PhotoField — up to 20 MB brochure files deserve the
 * same "picked file + don't close this" feedback while uploading. */
export function BrochureFileField() {
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);
  const pending = useActionFormPending();

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1">
        Upload file (PDF, JPEG, PNG, or WEBP)
      </label>
      <input
        type="file"
        name="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        disabled={pending}
        onChange={(e) => {
          const f = e.target.files?.[0];
          setPicked(f ? { name: f.name, size: f.size } : null);
        }}
        className="input-field file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--teal)]/10 file:text-[var(--teal)] file:text-sm file:font-medium file:cursor-pointer disabled:opacity-60"
      />
      <p className="text-xs text-[var(--muted)] mt-1">
        {picked ? `${picked.name} · ${(picked.size / (1024 * 1024)).toFixed(1)} MB` : "Up to 20 MB."}
      </p>
      {pending && picked && (
        <p className="text-xs text-[var(--teal)] mt-1">
          Uploading — this can take a moment on a slow connection. Don&apos;t close this page.
        </p>
      )}
    </div>
  );
}
