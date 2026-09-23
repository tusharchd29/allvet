"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { settleAdvance } from "./actions";

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
  const [pending, startTransition] = useTransition();

  return (
    <Card className="flex items-center justify-between">
      <div>
        <div className="font-medium text-[var(--ink)]">{advance.customerName}</div>
        <div className="text-sm text-[var(--muted)]">{formatDate(advance.created_at)}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="font-medium text-[var(--ink)]">{formatCurrency(advance.amount)}</div>
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
      </div>
    </Card>
  );
}
