import { Icon } from "./icon";

export function StatCard({
  label,
  value,
  icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  icon: string;
  tone?: "teal" | "seafoam" | "mint";
}) {
  // Teal is dark enough for a white glyph (4.67:1). Seafoam/mint are too
  // light for white-on-color to clear WCAG's 3:1 non-text contrast minimum,
  // so those two tones use a dark glyph on a light tint instead.
  const bg =
    tone === "teal" ? "bg-[var(--teal)]" : tone === "seafoam" ? "bg-[var(--seafoam)]/20" : "bg-[var(--mint)]/20";
  const iconColor =
    tone === "teal" ? "text-white" : tone === "seafoam" ? "text-[var(--teal)]" : "text-[#037a4e]";

  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${iconColor} shrink-0`}
      >
        <Icon name={icon} size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-semibold text-[var(--ink)] truncate">
          {value}
        </div>
        <div className="text-xs text-[var(--muted)]">{label}</div>
      </div>
    </div>
  );
}
