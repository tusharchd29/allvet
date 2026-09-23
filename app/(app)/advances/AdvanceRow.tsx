"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";
import { formatCurrency, formatDate } from "@/lib/utils";
import { settleAdvance } from "./actions";
import { updateEntry } from "../_shared/actions";

export function AdvanceRow({
  advance,
}: {
  advance: {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    customerName: string;
  };
}) {
  const [status, setStatus] = useState(advance.status);
  const [amount, setAmount] = useState(advance.amount);
  const [editing, setEditing] = useState(false);
  const [amountInput, setAmountInput] = useState(String(advance.amount));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    const value = Number(amountInput);
    if (!value || value <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateEntry("av_advances", advance.id, { amount: value }, ["/advances"]);
        setAmount(value);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save changes");
      }
    });
  }

  if (editing) {
    return (
      <Card>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field text-sm"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={pending} className="btn-primary text-xs px-4 py-1.5">
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAmountInput(String(amount));
                setError(null);
                setEditing(false);
              }}
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

  return (
    <Card className="flex items-center justify-between">
      <div>
        <div className="font-medium text-[var(--ink)]">{advance.customerName}</div>
        <div className="text-sm text-[var(--muted)]">{formatDate(advance.created_at)}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="font-medium text-[var(--ink)]">{formatCurrency(amount)}</div>
        {status === "pending" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await settleAdvance(advance.id);
                if (result.ok) setStatus("settled");
              })
            }
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {pending ? "…" : "Mark settled"}
          </button>
        ) : (
          <span className="status-fulfilled px-2.5 py-1 rounded-full text-xs font-semibold">
            Settled
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[var(--muted)] hover:text-[var(--teal)] p-1 -m-1"
          aria-label="Edit"
        >
          <Icon name="edit" size={16} />
        </button>
      </div>
    </Card>
  );
}
