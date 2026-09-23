"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import { recordPayment } from "./actions";

export type DueOrder = {
  id: string;
  customerId: string;
  customerName: string;
  product: string;
  amount: number;
  paid: number;
  due: number;
  payment_due_date: string | null;
  created_at: string;
};

export function PaymentRow({ order }: { order: DueOrder }) {
  const [paid, setPaid] = useState(order.paid);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const due = Math.max(order.amount - paid, 0);
  const overdue = due > 0 && isOverdue(order.payment_due_date);
  const settled = due <= 0;

  function submit() {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (value > due) {
      setError(`Amount can't exceed the due amount (${formatCurrency(due)})`);
      return;
    }
    setError(null);
    startTransition(async () => {
      await recordPayment(order.id, order.customerId, value, notes);
      setPaid((p) => p + value);
      setAmount("");
      setNotes("");
      setShowForm(false);
    });
  }

  return (
    <Card className={overdue ? "border-red-300" : undefined}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-[var(--ink)] truncate">{order.customerName}</div>
          <div className="text-sm text-[var(--muted)]">{order.product}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">
            Ordered {formatDate(order.created_at)}
            {order.payment_due_date && (
              <>
                {" · "}
                <span className={overdue ? "text-red-600 font-medium" : ""}>
                  Due {formatDate(order.payment_due_date)}
                  {overdue ? " (overdue)" : ""}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm text-[var(--muted)]">{formatCurrency(order.amount)}</div>
          {settled ? (
            <div className="text-xs font-semibold text-[var(--teal)] flex items-center gap-1 justify-end mt-0.5">
              <Icon name="check" size={12} /> Paid
            </div>
          ) : (
            <div className={`text-sm font-semibold mt-0.5 ${overdue ? "text-red-600" : "text-[var(--ink)]"}`}>
              Due {formatCurrency(due)}
            </div>
          )}
        </div>
      </div>

      {!settled && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Record payment
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  className="input-field flex-1"
                  placeholder={`Amount (max ${formatCurrency(due)})`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending}
                  className="btn-primary text-xs px-4"
                >
                  {pending ? "Saving…" : "Save"}
                </button>
              </div>
              <input
                className="input-field text-sm"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {error && <div className="text-xs text-red-600">{error}</div>}
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="text-xs text-[var(--muted)] underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
