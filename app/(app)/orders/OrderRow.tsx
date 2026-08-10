"use client";

import { useTransition } from "react";
import StatusPill from "@/components/StatusPill";
import { updateOrderStatus } from "./actions";
import { OrderStatus, ORDER_STATUSES, formatCurrency, formatDate } from "@/lib/utils";

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "dispatched",
  dispatched: "fulfilled",
  fulfilled: null,
};

const NEXT_LABEL: Record<OrderStatus, string> = {
  pending: "Confirm",
  confirmed: "Mark dispatched",
  dispatched: "Mark fulfilled",
  fulfilled: "",
};

export default function OrderRow({
  order,
  showRep,
}: {
  order: {
    id: string;
    product: string;
    quantity: string | null;
    amount: number | null;
    status: OrderStatus;
    created_at: string;
    customerName: string;
    repName?: string;
  };
  showRep: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const next = NEXT_STATUS[order.status];

  return (
    <div className="p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{order.customerName}</p>
        <p className="text-xs text-muted mt-0.5">
          {order.product}{order.quantity ? ` · ${order.quantity}` : ""}
          {order.amount ? ` · ${formatCurrency(order.amount)}` : ""}
          {showRep && order.repName ? ` · ${order.repName}` : ""}
        </p>
        <p className="text-xs text-muted mt-0.5">{formatDate(order.created_at)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusPill status={order.status} />
        {next && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => updateOrderStatus(order.id, next))}
            className="text-xs font-medium text-teal border border-teal/30 rounded-lg px-2.5 py-1.5 disabled:opacity-40 hover:bg-teal/5 transition-colors whitespace-nowrap"
          >
            {pending ? "…" : NEXT_LABEL[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}
