"use client";

import { useRef, useState, useTransition } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { submitClaim, advanceClaimStatus } from "./claim-actions";

export type Claim = {
  id: string;
  amount: number;
  notes: string | null;
  status: "pending" | "approved" | "paid";
  created_at: string;
};

const STATUS_LABEL: Record<Claim["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
};
const NEXT_LABEL: Record<Claim["status"], string | null> = {
  pending: "Approve",
  approved: "Mark paid",
  paid: null,
};

/**
 * Shown under a rep's advance-balance card. When the rep is owed money
 * back (balance < 0) and this is their own row, offers "Submit excess as a
 * claim" — a rep-initiated request the owner then approves and pays,
 * mirroring the reconciliation flow on asm-os. Existing claims for this rep
 * are listed below with their status; the owner can advance a claim
 * pending → approved → paid.
 */
export function ClaimsSection({
  balance,
  claims,
  canSubmit,
  canResolve,
}: {
  balance: number;
  claims: Claim[];
  canSubmit: boolean;
  canResolve: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await submitClaim(fd);
      if (!result.ok) {
        setError(result.message || "Couldn't submit claim");
        return;
      }
      formRef.current?.reset();
      setShowForm(false);
    });
  }

  function resolve(claimId: string, status: Claim["status"]) {
    setError(null);
    startTransition(async () => {
      const result = await advanceClaimStatus(claimId, status);
      if (!result.ok) setError(result.message || "Couldn't update claim");
    });
  }

  if (claims.length === 0 && !(canSubmit && balance < 0)) return null;

  return (
    <div className="mt-2 pt-2 border-t border-[var(--border)]">
      {claims.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {claims.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="text-[var(--ink)]">{formatCurrency(c.amount)}</span>
                <span className="text-[var(--muted)]"> · {formatDate(c.created_at)} · {STATUS_LABEL[c.status]}</span>
                {c.notes && <div className="text-[var(--muted)] truncate">{c.notes}</div>}
              </div>
              {canResolve && NEXT_LABEL[c.status] && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => resolve(c.id, c.status)}
                  className="btn-secondary text-xs px-2 py-1 whitespace-nowrap shrink-0"
                >
                  {NEXT_LABEL[c.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <div className="text-xs text-red-700 mb-2">{error}</div>}

      {canSubmit && balance < 0 && (
        showForm ? (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              defaultValue={Math.abs(balance)}
              className="input-field text-xs py-1.5"
            />
            <input name="notes" placeholder="Notes (optional)" className="input-field text-xs py-1.5" />
            <div className="flex gap-2">
              <button type="submit" disabled={pending} className="btn-primary text-xs px-3 py-1.5">
                {pending ? "Submitting…" : "Submit claim"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
            onClick={() => setShowForm(true)}
            className="text-xs text-[var(--teal)] font-medium"
          >
            Submit excess as a claim
          </button>
        )
      )}
    </div>
  );
}
