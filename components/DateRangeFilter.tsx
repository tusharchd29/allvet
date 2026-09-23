"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PRESETS: { label: string; days: number | null }[] = [
  { label: "All time", days: null },
  { label: "Today", days: 0 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Query-param driven date-range filter (`?from=&to=`) — presets plus a
 * custom range. Every page that reads `from`/`to` via lib/date-range.ts's
 * parseDateRange shares this same URL shape, so this one component filters
 * any of them.
 */
export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const isAllTime = !from && !to;

  function apply(newFrom: string | null, newTo: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (newFrom) params.set("from", newFrom);
    else params.delete("from");
    if (newTo) params.set("to", newTo);
    else params.delete("to");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function applyPreset(days: number | null) {
    if (days === null) {
      apply(null, null);
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    apply(isoDate(start), isoDate(end));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => applyPreset(p.days)}
          className={`text-xs px-2.5 py-1.5 rounded-full border whitespace-nowrap ${
            p.label === "All time" && isAllTime
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          aria-label="From date"
          className="input-field text-xs py-1.5 w-[132px]"
          value={from}
          onChange={(e) => apply(e.target.value || null, to || null)}
        />
        <span className="text-xs text-[var(--muted)]">to</span>
        <input
          type="date"
          aria-label="To date"
          className="input-field text-xs py-1.5 w-[132px]"
          value={to}
          onChange={(e) => apply(from || null, e.target.value || null)}
        />
      </div>
    </div>
  );
}
