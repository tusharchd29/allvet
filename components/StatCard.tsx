import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: LucideIcon;
  tone?: "default" | "mint";
}) {
  return (
    <div
      className={
        tone === "mint"
          ? "rounded-2xl p-5 bg-teal text-white"
          : "rounded-2xl p-5 bg-white border border-border/60"
      }
    >
      <div
        className={
          tone === "mint"
            ? "h-9 w-9 rounded-full bg-white/15 flex items-center justify-center mb-3"
            : "h-9 w-9 rounded-full bg-offwhite flex items-center justify-center mb-3"
        }
      >
        <Icon size={17} className={tone === "mint" ? "text-white" : "text-teal"} />
      </div>
      <p className={tone === "mint" ? "text-2xl font-semibold font-display" : "text-2xl font-semibold font-display text-ink"}>
        {value}
      </p>
      <p className={tone === "mint" ? "text-sm text-white/80 mt-0.5" : "text-sm text-muted mt-0.5"}>{label}</p>
      {sub && <p className={tone === "mint" ? "text-xs text-white/60 mt-2" : "text-xs text-muted mt-2"}>{sub}</p>}
    </div>
  );
}
