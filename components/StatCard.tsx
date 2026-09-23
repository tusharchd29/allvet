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
  const bg =
    tone === "teal"
      ? "bg-[var(--teal)]"
      : tone === "seafoam"
        ? "bg-[var(--seafoam)]"
        : "bg-[var(--mint)]";

  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-white shrink-0`}
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
