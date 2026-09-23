export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="w-full h-2 rounded-full bg-[var(--offwhite)] border border-[var(--border)] overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          background:
            clamped >= 100
              ? "var(--mint)"
              : clamped >= 60
                ? "var(--seafoam)"
                : "var(--teal)",
        }}
      />
    </div>
  );
}
