export default function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 w-full rounded-full bg-offwhite overflow-hidden">
      <div
        className="h-full rounded-full bg-mint transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
