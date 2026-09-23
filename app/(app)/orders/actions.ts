"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import type { OrderStatus } from "@/lib/utils";

/**
 * Looks up each typed product name against the catalog (case-insensitive)
 * and auto-adds any that aren't found, so the catalog stays a live record
 * of everything actually ordered — reps can keep typing new names on an
 * order rather than being blocked on someone adding it to Products first.
 * New rows are inserted `active: false` ("needs review") so they don't
 * silently start appearing as order-picker presets with no category/price
 * set; the owner reviews and activates them from the Products page.
 * Returns a name -> product_id map covering both existing and newly-added
 * products.
 */
async function resolveOrAddCatalogProducts(names: string[]): Promise<Map<string, string>> {
  const { data: catalog } = await supabaseAdmin.from("av_products").select("id, name");
  const byName = new Map((catalog ?? []).map((p) => [p.name.toLowerCase(), p.id as string]));

  const uniqueNames = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const missing = uniqueNames.filter((n) => !byName.has(n.toLowerCase()));

  if (missing.length > 0) {
    const { data: inserted } = await supabaseAdmin
      .from("av_products")
      .insert(missing.map((name) => ({ name, active: false })))
      .select("id, name");
    for (const p of inserted ?? []) {
      byName.set((p.name as string).toLowerCase(), p.id as string);
    }
  }

  return byName;
}

export async function createOrder(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer_id = String(formData.get("customer_id") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  const payment_due_date = String(formData.get("payment_due_date") || "") || null;

  if (!customer_id) return { ok: false, message: "Customer is required" };

  // Three parallel field arrays from the repeating OrderItemsField rows —
  // FormData.getAll preserves DOM order, so index i of each array is one
  // line item, regardless of rows added/removed in the browser.
  const productNames = formData.getAll("item_product").map((v) => String(v).trim());
  const quantities = formData.getAll("item_quantity").map((v) => Number(v));
  const unitPrices = formData
    .getAll("item_unit_price")
    .map((v) => (String(v).trim() ? Number(v) : null));

  const items = productNames
    .map((name, i) => ({ name, quantity: quantities[i], unitPrice: unitPrices[i] }))
    .filter((it) => it.name);

  if (items.length === 0) return { ok: false, message: "At least one product is required" };
  if (items.some((it) => !it.quantity || it.quantity <= 0 || Number.isNaN(it.quantity))) {
    return { ok: false, message: "Every product needs a quantity greater than zero" };
  }

  // Link each line back to the catalog by exact (case-insensitive) name
  // match, so a picked preset stays connected to its av_products row. A
  // freely typed name that isn't in the catalog yet gets auto-added
  // (inactive, pending the owner's review) rather than left unlinked.
  const catalogByName = await resolveOrAddCatalogProducts(items.map((it) => it.name));

  const lineItems = items.map((it) => {
    const line_amount = it.unitPrice != null ? Math.round(it.quantity * it.unitPrice * 100) / 100 : null;
    return {
      product_id: catalogByName.get(it.name.toLowerCase()) ?? null,
      product_name: it.name,
      quantity: it.quantity,
      unit_price: it.unitPrice,
      line_amount,
    };
  });

  // av_orders.product/quantity/amount stay populated as a maintained
  // summary so every existing reader of those columns (Payments, the
  // customer detail page, Reports, dashboard totals) keeps working
  // unchanged — av_order_items is the source of truth for the breakdown.
  const amount = lineItems.reduce((s, li) => s + (li.line_amount ?? 0), 0);
  const product = lineItems.map((li) => `${li.product_name} x${li.quantity}`).join(", ");
  const quantity = `${lineItems.length} item${lineItems.length === 1 ? "" : "s"}`;

  const { data: order, error } = await supabaseAdmin
    .from("av_orders")
    .insert({
      customer_id,
      rep_id: session.userId,
      product,
      quantity,
      amount,
      notes,
      payment_due_date,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  const { error: itemsError } = await supabaseAdmin
    .from("av_order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));
  if (itemsError) {
    // The order header exists but its lines don't — surface this precisely
    // rather than implying nothing was saved (which would invite a
    // duplicate order on retry). The owner can clean this up from Orders.
    return {
      ok: false,
      message: `Order created but its line items failed to save: ${itemsError.message}. Check Orders before re-submitting.`,
    };
  }

  revalidatePath("/orders");
  revalidatePath("/products");
  return { ok: true };
}

/**
 * Replaces an order's line items wholesale — delete existing rows, insert
 * the new set — and recomputes the maintained product/quantity/amount
 * summary on av_orders from them. A full-list replace is simpler and just
 * as correct as diffing row-by-row for a handful of items per order.
 */
export async function updateOrderItems(orderId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: order } = await supabaseAdmin
    .from("av_orders")
    .select("rep_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, message: "Order not found" };
  if (session.role !== "owner" && order.rep_id !== session.userId) {
    return { ok: false, message: "Order not found" };
  }

  const productNames = formData.getAll("item_product").map((v) => String(v).trim());
  const quantities = formData.getAll("item_quantity").map((v) => Number(v));
  const unitPrices = formData
    .getAll("item_unit_price")
    .map((v) => (String(v).trim() ? Number(v) : null));

  const items = productNames
    .map((name, i) => ({ name, quantity: quantities[i], unitPrice: unitPrices[i] }))
    .filter((it) => it.name);

  if (items.length === 0) return { ok: false, message: "At least one product is required" };
  if (items.some((it) => !it.quantity || it.quantity <= 0 || Number.isNaN(it.quantity))) {
    return { ok: false, message: "Every product needs a quantity greater than zero" };
  }

  const catalogByName = await resolveOrAddCatalogProducts(items.map((it) => it.name));

  const lineItems = items.map((it) => {
    const line_amount = it.unitPrice != null ? Math.round(it.quantity * it.unitPrice * 100) / 100 : null;
    return {
      product_id: catalogByName.get(it.name.toLowerCase()) ?? null,
      product_name: it.name,
      quantity: it.quantity,
      unit_price: it.unitPrice,
      line_amount,
    };
  });

  const amount = lineItems.reduce((s, li) => s + (li.line_amount ?? 0), 0);
  const product = lineItems.map((li) => `${li.product_name} x${li.quantity}`).join(", ");
  const quantity = `${lineItems.length} item${lineItems.length === 1 ? "" : "s"}`;

  const { error: deleteError } = await supabaseAdmin
    .from("av_order_items")
    .delete()
    .eq("order_id", orderId);
  if (deleteError) return { ok: false, message: deleteError.message };

  const { error: insertError } = await supabaseAdmin
    .from("av_order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: orderId })));
  if (insertError) return { ok: false, message: insertError.message };

  const { error: updateError } = await supabaseAdmin
    .from("av_orders")
    .update({ product, quantity, amount, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, message: updateError.message };

  revalidatePath("/orders");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  return { ok: true };
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "dispatched",
  dispatched: "fulfilled",
  fulfilled: null,
};

export async function advanceOrderStatus(orderId: string, currentStatus: OrderStatus) {
  const session = await getSession();
  if (!session) redirect("/login");

  const next = NEXT_STATUS[currentStatus];
  if (!next) throw new Error("Order is already fulfilled");

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { status: next, updated_at: now };
  if (next === "confirmed") update.confirmed_at = now;
  if (next === "dispatched") update.dispatched_at = now;
  if (next === "fulfilled") {
    update.fulfilled_by = session.userId;
    update.fulfilled_at = now;
  }

  const { error } = await supabaseAdmin.from("av_orders").update(update).eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/targets");
  return { ok: true };
}

const PREV_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: null,
  confirmed: "pending",
  dispatched: "confirmed",
  fulfilled: "dispatched",
};

/**
 * Moves an order back a stage — e.g. a "fulfilled" order that turns out to
 * still be in transit, or was marked confirmed by mistake. Clears the
 * timestamp for the stage being left so re-advancing later records a fresh
 * one, rather than leaving a stale confirmed_at/dispatched_at/fulfilled_at
 * from the first time through.
 */
export async function revertOrderStatus(orderId: string, currentStatus: OrderStatus) {
  const session = await getSession();
  if (!session) redirect("/login");

  const prev = PREV_STATUS[currentStatus];
  if (!prev) return { ok: false, message: "Order is already at the earliest stage" };

  const update: Record<string, unknown> = { status: prev, updated_at: new Date().toISOString() };
  if (currentStatus === "confirmed") update.confirmed_at = null;
  if (currentStatus === "dispatched") update.dispatched_at = null;
  if (currentStatus === "fulfilled") {
    update.fulfilled_at = null;
    update.fulfilled_by = null;
  }

  const { error } = await supabaseAdmin.from("av_orders").update(update).eq("id", orderId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/targets");
  return { ok: true };
}
