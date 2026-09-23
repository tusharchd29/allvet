"use client";

const PRESETS = [7, 15, 30, 45];

/** Quick-fill buttons for a nearby `<input type="date" name={inputName}>`. */
export function DueDatePresets({ inputName = "payment_due_date" }: { inputName?: string }) {
  function setDays(days: number) {
    const el = document.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
    if (!el) return;
    const d = new Date();
    d.setDate(d.getDate() + days);
    el.value = d.toISOString().slice(0, 10);
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return (
    <div className="flex gap-2 mt-1.5">
      {PRESETS.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => setDays(d)}
          className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
        >
          +{d} days
        </button>
      ))}
    </div>
  );
}
