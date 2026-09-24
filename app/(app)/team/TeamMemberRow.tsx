"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";
import { updateUserName } from "./actions";

type User = { id: string; name: string; role: "owner" | "rep"; active: boolean };

export function TeamMemberRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const [name, setName] = useState(user.name);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = String(fd.get("name") || "").trim();
    setError(null);
    startTransition(async () => {
      const result = await updateUserName(user.id, next);
      if (result.ok) {
        setName(next);
        setEditing(false);
      } else {
        setError(result.message ?? "Couldn't save");
      }
    });
  }

  if (editing) {
    return (
      <Card>
        <form onSubmit={handleSave} className="flex items-center gap-2">
          <input
            name="name"
            defaultValue={name}
            required
            autoFocus
            maxLength={60}
            className="input-field text-sm flex-1"
          />
          <button type="submit" disabled={pending} className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setEditing(false);
            }}
            disabled={pending}
            className="text-xs text-[var(--muted)] underline whitespace-nowrap"
          >
            Cancel
          </button>
        </form>
        {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between">
      <div>
        <div className="font-medium text-[var(--ink)]">
          {name}
          {isSelf && <span className="text-xs text-[var(--muted)] font-normal"> (you)</span>}
        </div>
        <div className="text-xs text-[var(--muted)] capitalize">
          {user.role}
          {!user.active && " · Inactive"}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-[var(--muted)] hover:text-[var(--teal)] p-1 -m-1"
        aria-label={`Rename ${name}`}
      >
        <Icon name="edit" size={16} />
      </button>
    </Card>
  );
}
