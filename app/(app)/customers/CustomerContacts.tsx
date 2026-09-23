"use client";

import { useRef, useState, useTransition } from "react";
import { createContact, deleteContact } from "./contacts-actions";
import { Icon } from "@/components/icon";

export type Contact = { id: string; name: string; role: string | null; phone: string | null };

/** Extra named people at a customer (owner, purchase manager, etc.),
 * alongside the customer's own single phone field. Same add/list/delete
 * pattern as TourStops in app/(app)/tours/TourStops.tsx. */
export function CustomerContacts({
  customerId,
  contacts,
}: {
  customerId: string;
  contacts: Contact[];
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createContact(fd);
      if (!result.ok) {
        setError(result.message || "Couldn't add that contact");
        return;
      }
      formRef.current?.reset();
      setAdding(false);
    });
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteContact(id, customerId);
      if (!result.ok) setError(result.message || "Couldn't remove that contact");
    });
  }

  return (
    <div className="mb-6">
      <div className="font-medium text-[var(--ink)] mb-2">Other contacts</div>

      {contacts.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <span className="text-[var(--ink)]">{c.name}</span>
                {c.role && <span className="text-[var(--muted)]"> · {c.role}</span>}
                {c.phone && <span className="text-[var(--muted)]"> · {c.phone}</span>}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(c.id)}
                className="text-[var(--muted)] hover:text-red-600 shrink-0 p-1 disabled:opacity-30"
                aria-label="Remove contact"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {contacts.length === 0 && !adding && (
        <div className="text-sm text-[var(--muted)] mb-2">No other contacts added yet.</div>
      )}

      {error && <div className="text-xs text-red-700 mb-2">{error}</div>}

      {adding ? (
        <form ref={formRef} onSubmit={handleAdd} className="space-y-2">
          <input type="hidden" name="customer_id" value={customerId} />
          <input name="name" required placeholder="Name" className="input-field text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="role"
              placeholder="Role (e.g. Purchase manager)"
              className="input-field text-sm"
            />
            <input name="phone" placeholder="Phone (optional)" className="input-field text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn-primary text-xs px-3 py-1.5">
              {pending ? "Adding…" : "Add contact"}
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
          <Icon name="plus" size={12} /> Add a contact
        </button>
      )}
    </div>
  );
}
