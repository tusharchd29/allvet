"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { Icon } from "@/components/icon";
import { formatCurrency, formatDate, ageingLabel, type OrderStatus } from "@/lib/utils";
import { advanceOrderStatus } from "./actions";
import { updateEntry } from "../_shared/actions";

const NEXT_LABEL: Record<OrderStatus, string | null> = {
  pending: "Confirm order",
  confirmed: "Mark dispatched",
  dispatched: "Mark fulfilled",
  fulfilled: null,
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
  notes?: string | null;
  payment_due_date?: string | null;
};

type LineItem = { product_name: string; quantity: number };

export function OrderRow({ order, items = [] }: { order: Order; items?: LineItem[] }) {
  const hasItems = items.length > 0;
  const [status, setStatus] = useState(order.status);
  const [pending, startTransition] = useTransition();
  const label = NEXT_LABEL[status];

  const [editing, setEditing] = useState(false);
  // Legacy (pre-line-items) orders can still have product/quantity/amount
  // edited inline. Orders with real line items keep those fields read-only
  // here — the breakdown lives in av_order_items — and only notes / the
  // due date are editable.
  const [values, setValues] = useState({
    product: order.product,
    quantity: order.quantity ?? "",
    amount: order.amount ?? "",
    payment_due_date: order.payment_due_date ?? "",
    notes: order.notes ?? "",
  });
  const [saved, setSaved] = useState({
    product: order.product,
    quantity: order.quantity,
    amount: order.amount,
  });
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

  function save() {
    if (!hasItems && !values.product.trim()) {
      setError("Product is required");
      return;
    }
    setError(null);
    startEditTransition(async () => {
      try {
        const payload: Record<string, unknown> = {
          payment_due_date: values.payment_due_date || null,
          notes: values.notes.trim() || null,
        };
        if (!hasItems) {
          payload.product = values.product.trim();
          payload.quantity = values.quantity ? String(values.quantity) : null;
          payload.amount = values.amount === "" ? null : Number(values.amount);
        }
        await updateEntry("av_orders", order.id, payload, ["/orders", "/payments", "/dashboard"]);
        if (!hasItems) {
          setSaved({
            product: values.product.trim(),
            quantity: values.quantity ? String(values.quantity) : null,
            amount: values.amount === "" ? null : Number(values.amount),
          });
        }
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
          {hasItems ? (
            <div>
              <div className="text-xs font-medium text-[var(--ink)] mb-1">Products</div>
              <div className="text-sm text-[var(--muted)]">
                {items.map((it) => `${it.product_name} x${it.quantity}`).join(", ")}
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">
                To change products, edit the order items directly isn&apos;t supported yet — create a
                new order instead.
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">Product</label>
                <input
                  className="input-field text-sm"
                  value={values.product}
                  onChange={(e) => setValues((v) => ({ ...v, product: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">Quantity</label>
                  <input
                    className="input-field text-sm"
                    value={values.quantity}
                    onChange={(e) => setValues((v) => ({ ...v, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field text-sm"
                    value={values.amount}
                    onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
                  />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1">Payment due date</label>
            <input
              type="date"
              className="input-field text-sm"
              value={values.payment_due_date}
              onChange={(e) => setValues((v) => ({ ...v, payment_due_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1">Notes</label>
            <textarea
              rows={2}
              className="input-field text-sm"
              value={values.notes}
              onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={editPending} className="btn-primary text-xs px-4 py-1.5">
              {editPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setValues({
                  product: saved.product,
                  quantity: saved.quantity ?? "",
                  amount: saved.amount ?? "",
                  payment_due_date: order.payment_due_date ?? "",
                  notes: order.notes ?? "",
                });
                setError(null);
                setEditing(false);
              }}
              disabled={editPending}
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
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium text-[var(--ink)] truncate">{order.customerName}</div>
        <div className="text-sm text-[var(--muted)]">
          {hasItems
            ? items.map((it) => `${it.product_name} x${it.quantity}`).join(", ")
            : `${saved.product}${saved.quantity ? ` · ${saved.quantity}` : ""}`}{" "}
          · {formatCurrency(saved.amount)}
        </div>
        <div className="text-xs text-[var(--muted)] mt-0.5">
          {formatDate(order.created_at)} · {ageingLabel(order)}
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
      </div>
    </Card>
  );
}
