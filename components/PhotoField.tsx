/**
 * File input for attaching a supporting-evidence photo to a Visit, Expense,
 * or Travel Log entry. Plain HTML file input — it posts through the
 * enclosing Server Action's FormData with no client JS required, and the
 * device camera opens directly on mobile via `capture`.
 */
export function PhotoField({ label = "Photo (optional)" }: { label?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
      <input
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        className="input-field file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--teal)]/10 file:text-[var(--teal)] file:text-sm file:font-medium file:cursor-pointer"
      />
      <p className="text-xs text-[var(--muted)] mt-1">JPEG, PNG, WEBP, or HEIC — up to 10 MB.</p>
    </div>
  );
}
