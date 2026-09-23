"use client";

import { useRef, useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { Icon } from "@/components/icon";
import { formatCurrency, formatDate, ageingLabel, type OrderStatus } from "@/lib/utils";
import { advanceOrderStatus, revertOrderStatus, updateOrderItems } from "./actions";
import { updateEntry } from "../_shared/actions";
import { OrderItemsField, type CatalogProduct } from "./OrderItemsField";

const NEXT_LABEL: Record<OrderStatus, string | null> = {
  pending: "Confirm order",
  confirmed: "Mark dispatched",
  dispatched: "Mark fulfilled",
  fulfilled: null,
};
const PREV_LABEL: Record<OrderStatus, string | null> = {
  pending: null,
  confirmed: "Move back to pending",
  dispatched: "Move back to confirmed",
  fulfilled: "Move back to dispatched",
};

type Order = {
  id: string;
  product: string;
  quantity: string | null;
  amount: number | null;
  status: OrderStatus;
  created_at: string;
  confirmed_at?: string | null;
  dispatched_at?: string | null;
  fulfilled_at?: string | null;
  customerName: string;
  repName?: string | null;
  notes?: string | null;
  payment_due_date?: string | null;
};

type LineItem = { product_name: string; quantity: number; unit_price?: number | null };

export function OrderRow({
  order,
  items = [],
  products = [],
  showRep = false,
}: {
  order: Order;
  items?: LineItem[];
  products?: CatalogProduct[];
  showRep?: boolean;
}) {
  const hasItems = items.length > 0;
  const [status, setStatus] = useState(order.status);
  const [pending, startTransition] = useTransition();
  const label = NEXT_LABEL[status];

  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [editPending, startEditTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  function revert() {
    startTransition(async () => {
      const result = await revertOrderStatus(order.id, status);
      if (result.ok) {
        const prevMap: Record<OrderStatus, OrderStatus> = {
          pending: "pending",
          confirmed: "pending",
          dispatched: "confirmed",
          fulfilled: "dispatched",
        };
        setStatus(prevMap[status]);
      }
    });
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startEditTransition(async () => {
      try {
        if (hasItems) {
          const result = await updateOrderItems(order.id, fd);
          if (!result.ok) throw new Error(result.message);
        }
        const payload: Record<string, unknown> = {
          payment_due_date: String(fd.get("payment_due_date") || "") || null,
          notes: String(fd.get("notes") || "").trim() || null,
        };
        if (!hasItems) {
          const product = String(fd.get("product") || "").trim();
          if (!product) throw new Error("Product is required");
          payload.product = product;
          payload.quantity = String(fd.get("quantity") || "").trim() || null;
          const amountRaw = String(fd.get("amount") || "");
          payload.amount = amountRaw === "" ? null : Number(amountRaw);
        }
        await updateEntry("av_orders", order.id, payload, ["/orders", "/payments", "/dashboard"]);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save changes");
      }
    });
  }

  if (editing) {
    return (
      <Card>
        <form ref={formRef} onSubmit={handleSave} className="space-y-3">
          {hasItems ? (
            <OrderItemsField
              products={products}
              initialItems={items.map((it) => ({
                product_name: it.product_name,
                quantity: it.quantity,
                unit_price: it.unit_price ?? null,
              }))}
            />
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">Product</label>
                <input name="product" defaultValue={order.product} className="input-field text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">Quantity</label>
                  <input
                    name="quantity"
                    defaultValue={order.quantity ?? ""}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">Amount (₹)</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={order.amount ?? ""}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1">Payment due date</label>
            <input
              type="date"
              name="payment_due_date"
              defaultValue={order.payment_due_date ?? ""}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={order.notes ?? ""}
              className="input-field text-sm"
            />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button type="submit" disabled={editPending} className="btn-primary text-xs px-4 py-1.5">
              {editPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setEditing(false);
              }}
              disabled={editPending}
              className="text-xs text-[var(--muted)] underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium text-[var(--ink)] truncate">{order.customerName}</div>
        <div className="text-sm text-[var(--muted)]">
          {hasItems
            ? items.map((it) => `${it.product_name} x${it.quantity}`).join(", ")
            : `${order.product}${order.quantity ? ` · ${order.quantity}` : ""}`}{" "}
          · {formatCurrency(order.amount)}
        </div>
        <div className="text-xs text-[var(--muted)] mt-0.5">
          {formatDate(order.created_at)} · {ageingLabel(order)}
          {showRep && order.repName && <> · {order.repName}</>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <StatusPill status={status} />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[var(--muted)] hover:text-[var(--teal)] p-1 -m-1"
            aria-label="Edit"
          >
            <Icon name="edit" size={16} />
          </button>
        </div>
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
        {PREV_LABEL[status] && (
          <button
            type="button"
            onClick={revert}
            disabled={pending}
            className="text-xs text-[var(--muted)] underline whitespace-nowrap"
          >
            {PREV_LABEL[status]}
          </button>
        )}
      </div>
    </Card>
  );
}
