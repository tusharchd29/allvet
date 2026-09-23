import type { EntityPhoto } from "@/lib/photos";

/** Small thumbnail strip for photos attached to a Visit, Expense, or Travel
 * Log entry. Each thumbnail opens the full-size signed URL in a new tab. */
export function PhotoThumbs({ photos }: { photos: EntityPhoto[] | undefined }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div className="flex gap-2 mt-2 flex-wrap">
      {photos.map((p) => (
        <a
          key={p.id}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-14 h-14 rounded-lg overflow-hidden border border-[var(--border)] shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL, not a local/static asset */}
          <img src={p.url} alt="Attached evidence" className="w-full h-full object-cover" />
        </a>
      ))}
    </div>
  );
}
