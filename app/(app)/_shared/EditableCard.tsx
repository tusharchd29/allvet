"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";
import { updateEntry } from "./actions";

export type EditField =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "date" | "textarea";
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "checkbox";
    };

type Value = string | number | boolean | null;

/**
 * Wraps a read-only row in a Card and adds a pencil icon that flips the
 * card into an inline edit form. Saves through the generic `updateEntry`
 * server action, so any av_* table can opt in just by listing its fields.
 */
export function EditableCard({
  table,
  id,
  fields,
  initialValues,
  revalidate,
  children,
  className,
}: {
  table: string;
  id: string;
  fields: EditField[];
  initialValues: Record<string, Value>;
  revalidate: string[];
  children: ReactNode;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, Value>>(initialValues);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(name: string, value: Value) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function cancel() {
    setValues(initialValues);
    setError(null);
    setEditing(false);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const payload: Record<string, unknown> = {};
        for (const f of fields) {
          const raw = values[f.name];
          if (f.type === "number") {
            payload[f.name] = raw === "" || raw === null || raw === undefined ? null : Number(raw);
          } else if (f.type === "checkbox") {
            payload[f.name] = Boolean(raw);
          } else {
            payload[f.name] = raw === "" || raw === null || raw === undefined ? null : raw;
          }
        }
        await updateEntry(table, id, payload, revalidate);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save changes");
      }
    });
  }

  if (!editing) {
    return (
      <Card className={className}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">{children}</div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[var(--muted)] hover:text-[var(--teal)] shrink-0 p-1 -m-1"
            aria-label="Edit"
          >
            <Icon name="edit" size={16} />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.name}>
            {f.type !== "checkbox" && (
              <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                {f.label}
              </label>
            )}
            {f.type === "textarea" ? (
              <textarea
                rows={2}
                className="input-field text-sm"
                placeholder={f.placeholder}
                value={(values[f.name] as string) ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
              />
            ) : f.type === "select" ? (
              <select
                className="input-field text-sm"
                value={(values[f.name] as string) ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={Boolean(values[f.name])}
                  onChange={(e) => set(f.name, e.target.checked)}
                />
                {f.label}
              </label>
            ) : (
              <input
                type={f.type}
                step={f.type === "number" ? "0.01" : undefined}
                className="input-field text-sm"
                placeholder={f.placeholder}
                value={(values[f.name] as string | number) ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
          </div>
        ))}
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="btn-primary text-xs px-4 py-1.5"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="text-xs text-[var(--muted)] underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </Card>
  );
}
