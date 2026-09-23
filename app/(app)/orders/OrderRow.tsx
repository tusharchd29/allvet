"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency, formatDate, type OrderStatus } from "@/lib/utils";
import { advanceOrderStatus } from "./actions";

const NEXT_LABEL: Record<OrderStatus, string | null> = {
  pending: "Confirm order",
  confirmed: "Mark dispatched",
  dispatched: "Mark fulfilled",
  fulfilled: null,
};

export function OrderRow({
  order,
}: {
  order: {
    id: string;
    product: string;
    quantity: string | null;
    amount: number | null;
    status: OrderStatus;
    created_at: string;
    customerName: string;
  };
}) {
  const [status, setStatus] = useState(order.status);
  const [pending, startTransition] = useTransition();
  const label = NEXT_LABEL[status];

  function advance() {
    startTransition(async () => {
      const result = await advanceOrderStatus(order.id, status);
      if (result.ok) {
        const nextMap: Record<OrderStatus, OrderStatus> = {
          pending: "confirmed",
          confirmed: "dispatched",
          dispatched: "fulfilled",
          fulfilled: "fulfilled",
        };
        setStatus(nextMap[status]);
      }
    });
  }

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium text-[var(--ink)] truncate">{order.customerName}</div>
        <div className="text-sm text-[var(--muted)]">
          {order.product} {order.quantity ? `· ${order.quantity}` : ""} ·{" "}
          {formatCurrency(order.amount)}
        </div>
        <div className="text-xs text-[var(--muted)] mt-0.5">
          {formatDate(order.created_at)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <StatusPill status={status} />
        {label && (
          <button
            type="button"
            onClick={advance}
            disabled={pending}
            className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
          >
            {pending ? "Updating…" : label}
          </button>
        )}
      </div>
    </Card>
  );
}
