import { quoteOfDay } from "@/lib/quotes";
import { Icon } from "@/components/icon";

export function DailyQuote() {
  const quote = quoteOfDay();
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 mb-4"
      style={{ background: "#fdf3e6", borderLeft: "3px solid var(--saffron)" }}
    >
      <Icon name="flower" size={16} className="text-[var(--saffron)] mt-0.5 shrink-0" />
      <div>
        <p className="text-sm text-[var(--ink)] italic leading-snug">&ldquo;{quote.text}&rdquo;</p>
        <p className="text-xs text-[var(--muted)] mt-1">— {quote.source}</p>
      </div>
    </div>
  );
}
