"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import type { OrderStatus } from "@/lib/utils";

export async function createOrder(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer_id = String(formData.get("customer_id") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  const payment_due_date = String(formData.get("payment_due_date") || "") || null;

  if (!customer_id) throw new Error("Customer is required");

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

  if (items.length === 0) throw new Error("At least one product is required");
  if (items.some((it) => !it.quantity || it.quantity <= 0 || Number.isNaN(it.quantity))) {
    throw new Error("Every product needs a quantity greater than zero");
  }

  // Link each line back to the catalog by exact (case-insensitive) name
  // match, so a picked preset stays connected to its av_products row. A
  // freely typed name that isn't in the catalog still works fine — it's
  // just not linked.
  const { data: catalog } = await supabaseAdmin.from("av_products").select("id, name");
  const catalogByName = new Map((catalog ?? []).map((p) => [p.name.toLowerCase(), p.id as string]));

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

  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabaseAdmin
    .from("av_order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/orders");
  redirect("/orders");
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
