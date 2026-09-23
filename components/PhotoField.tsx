"use client";

import { useState } from "react";
import { useActionFormPending } from "./ActionForm";

/**
 * File input for attaching a supporting-evidence photo to a Visit, Expense,
 * or Travel Log entry. Posts through the enclosing `ActionForm`'s FormData;
 * the device camera opens directly on mobile via `capture`.
 *
 * A field rep uploading an 8MB photo on 2G/3G has no way to tell a slow
 * upload apart from a hung one — this shows the picked file's name/size up
 * front and an explicit "don't close this" notice while the surrounding
 * form is submitting, instead of a silent file input.
 *
 * Deliberately has no `capture` attribute: with one set, several mobile
 * browsers (notably iOS Safari) skip the normal "Photo Library / Take
 * Photo / Choose File" picker and jump straight to the camera, so a rep
 * uploading a receipt or an already-taken photo has no way to pick from
 * their gallery. Leaving `capture` off keeps both options.
 */
export function PhotoField({ label = "Photo (optional)" }: { label?: string }) {
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);
  const pending = useActionFormPending();

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
      <input
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp,image/heic"
        disabled={pending}
        onChange={(e) => {
          const f = e.target.files?.[0];
          setPicked(f ? { name: f.name, size: f.size } : null);
        }}
        className="input-field file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--teal)]/10 file:text-[var(--teal)] file:text-sm file:font-medium file:cursor-pointer disabled:opacity-60"
      />
      <p className="text-xs text-[var(--muted)] mt-1">
        {picked
          ? `${picked.name} · ${(picked.size / (1024 * 1024)).toFixed(1)} MB`
          : "JPEG, PNG, WEBP, or HEIC — up to 10 MB."}
      </p>
      {pending && picked && (
        <p className="text-xs text-[var(--teal)] mt-1">
          Uploading — this can take a moment on a slow connection. Don&apos;t close this page.
        </p>
      )}
    </div>
  );
}
