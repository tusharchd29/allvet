"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { formatCurrency, formatPackSize } from "@/lib/utils";

export type CatalogProduct = {
  id: string;
  name: string;
  category: string | null;
  default_unit: string | null;
  pack_size: number | null;
  default_price: number | null;
};

type Row = { key: number; product: string; quantity: string; unitPrice: string };

export type InitialItem = { product_name: string; quantity: number; unit_price: number | null };

let nextKey = 0;
function blankRow(): Row {
  return { key: nextKey++, product: "", quantity: "1", unitPrice: "" };
}
function rowFromItem(it: InitialItem): Row {
  return {
    key: nextKey++,
    product: it.product_name,
    quantity: String(it.quantity),
    unitPrice: it.unit_price != null ? String(it.unit_price) : "",
  };
}

/**
 * Repeating product/quantity/price rows for an order, posted through the
 * enclosing Server Action as three parallel `item_product` / `item_quantity`
 * / `item_unit_price` field arrays (FormData.getAll keeps DOM order, so the
 * arrays line up by index — no client-side JSON serialization needed).
 * Picking a name already in the catalog prefills its default price.
 * Pass `initialItems` to seed the rows when editing an existing order.
 */
export function OrderItemsField({
  products,
  initialItems,
}: {
  products: CatalogProduct[];
  initialItems?: InitialItem[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initialItems && initialItems.length > 0 ? initialItems.map(rowFromItem) : [blankRow()],
  );

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function onProductChange(key: number, name: string) {
    const match = products.find((p) => p.name.toLowerCase() === name.trim().toLowerCase());
    setRows((rs) =>
      rs.map((r) =>
        r.key === key
          ? { ...r, product: name, unitPrice: match?.default_price != null && !r.unitPrice ? String(match.default_price) : r.unitPrice }
          : r,
      ),
    );
  }

  const total = rows.reduce((s, r) => s + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0), 0);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1">Products</label>
      <div className="space-y-2">
        {rows.map((r) => {
          const matched = products.find((p) => p.name.toLowerCase() === r.product.trim().toLowerCase());
          const packHint = matched ? formatPackSize(matched.pack_size, matched.default_unit) : null;
          return (
            <div key={r.key}>
              <div className="grid grid-cols-[1fr_64px_88px_28px] gap-2 items-center">
                <input
                  name="item_product"
                  required
                  className="input-field text-sm"
                  placeholder="Product name"
                  list="catalog-products"
                  value={r.product}
                  onChange={(e) => onProductChange(r.key, e.target.value)}
                />
                <input
                  name="item_quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="input-field text-sm"
                  placeholder="Qty"
                  value={r.quantity}
                  onChange={(e) => updateRow(r.key, { quantity: e.target.value })}
                />
                <input
                  name="item_unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field text-sm"
                  placeholder="Price"
                  value={r.unitPrice}
                  onChange={(e) => updateRow(r.key, { unitPrice: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setRows((rs) => (rs.length === 1 ? rs : rs.filter((row) => row.key !== r.key)))}
                  disabled={rows.length === 1}
                  className="text-[var(--muted)] hover:text-red-600 disabled:opacity-30 p-1.5"
                  aria-label="Remove product"
                >
                  <Icon name="x" size={15} />
                </button>
              </div>
              {packHint && (
                <div className="text-xs text-[var(--muted)] mt-0.5 pl-0.5">Pack size: {packHint}</div>
              )}
            </div>
          );
        })}
      </div>

      <datalist id="catalog-products">
        {products.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, blankRow()])}
        className="text-sm text-[var(--teal)] font-medium inline-flex items-center gap-1 mt-2.5"
      >
        <Icon name="plus" size={14} /> Add another product
      </button>

      <div className="text-sm text-[var(--muted)] mt-3 pt-3 border-t border-[var(--border)]">
        Order total: <span className="font-medium text-[var(--ink)]">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
