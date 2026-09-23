"use client";

import { useRef, useState, useTransition } from "react";
import { createTourStop, toggleTourStop, deleteTourStop } from "./actions";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/icon";

export type Stop = {
  id: string;
  customerName: string | null;
  planned_date: string;
  notes: string | null;
  completed: boolean;
};
type Customer = { id: string; name: string };

/** Planned customer stops for one week's tour — add, mark visited, remove.
 * Nested inside the tour's EditableCard as static children, so it only
 * shows in the card's non-editing view (which is fine: stop management
 * doesn't need the tour's own field-edit mode). */
export function TourStops({
  tourId,
  stops,
  customers,
  weekStart,
}: {
  tourId: string;
  stops: Stop[];
  customers: Customer[];
  weekStart: string;
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneCount = stops.filter((s) => s.completed).length;

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createTourStop(fd);
      if (result && result.ok === false) {
        setError(result.message || "Couldn't add that stop — try again.");
        return;
      }
      formRef.current?.reset();
      setAdding(false);
    });
  }

  return (
    <div className="mt-2 pt-2 border-t border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
      <div className="text-xs text-[var(--muted)] mb-2">
        {stops.length === 0 ? "No stops planned yet" : `${doneCount}/${stops.length} visited`}
      </div>

      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 mb-2">
          {error}
        </div>
      )}

      {stops.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {stops.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
              <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={s.completed}
                  disabled={pending}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setError(null);
                    startTransition(async () => {
                      const result = await toggleTourStop(s.id, tourId, checked);
                      if (!result.ok) setError(result.message || "Couldn't update that stop.");
                    });
                  }}
                  className="w-4 h-4 shrink-0"
                />
                <span
                  className={`truncate ${s.completed ? "line-through text-[var(--muted)]" : "text-[var(--ink)]"}`}
                >
                  {s.customerName ?? "Unnamed stop"} · {formatDate(s.planned_date)}
                  {s.notes ? ` — ${s.notes}` : ""}
                </span>
              </label>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await deleteTourStop(s.id, tourId);
                    if (!result.ok) setError(result.message || "Couldn't remove that stop.");
                  });
                }}
                className="text-[var(--muted)] hover:text-red-600 shrink-0 p-1 disabled:opacity-30"
                aria-label="Remove stop"
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form ref={formRef} onSubmit={handleAdd} className="space-y-2">
          <input type="hidden" name="tour_id" value={tourId} />
          <select name="customer_id" className="input-field text-xs py-1.5" defaultValue="">
            <option value="">No specific customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              name="planned_date"
              required
              defaultValue={weekStart}
              className="input-field text-xs py-1.5"
            />
            <input name="notes" placeholder="Notes (optional)" className="input-field text-xs py-1.5" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn-primary text-xs px-3 py-1.5">
              {pending ? "Adding…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              disabled={pending}
              className="text-xs text-[var(--muted)] underline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs text-[var(--teal)] font-medium inline-flex items-center gap-1"
        >
          <Icon name="plus" size={12} /> Add a stop
        </button>
      )}
    </div>
  );
}
