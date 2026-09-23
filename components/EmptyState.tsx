import { Icon } from "./icon";

export function EmptyState({
  icon = "package",
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-[var(--offwhite)] border border-[var(--border)] flex items-center justify-center mb-3 text-[var(--muted)]">
        <Icon name={icon} size={20} />
      </div>
      <div className="font-medium text-[var(--ink)]">{title}</div>
      {subtitle && (
        <div className="text-sm text-[var(--muted)] mt-1 max-w-xs">
          {subtitle}
        </div>
      )}
    </div>
  );
}
