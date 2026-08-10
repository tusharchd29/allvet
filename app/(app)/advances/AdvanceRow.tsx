"use client";
import { useTransition } from "react";
import { settleAdvance } from "./actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdvanceRow({ advance }: { advance: any }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-ink">{advance.av_customers?.name}</p>
        <p className="text-xs text-muted mt-0.5">{formatDate(advance.created_at)}</p>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-ink">{formatCurrency(advance.amount)}</p>
        {advance.status === "pending" ? (
          <button disabled={pending} onClick={() => startTransition(() => settleAdvance(advance.id))} className="text-xs font-medium text-teal border border-teal/30 rounded-lg px-2.5 py-1.5">
            {pending ? "…" : "Mark settled"}
          </button>
        ) : (
          <span className="text-xs text-[#017a5c] bg-[#d7f7ee] rounded-full px-2.5 py-1">Settled</span>
        )}
      </div>
    </div>
  );
}
