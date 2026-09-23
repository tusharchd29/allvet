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
  const product = String(formData.get("product") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim() || null;
  const amountRaw = String(formData.get("amount") || "").trim();
  const amount = amountRaw ? Number(amountRaw) : null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!customer_id || !product) {
    throw new Error("Customer and product are required");
  }

  const { error } = await supabaseAdmin.from("av_orders").insert({
    customer_id,
    rep_id: session.userId,
    product,
    quantity,
    amount,
    notes,
    status: "pending",
  });

  if (error) throw new Error(error.message);

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

  const update: Record<string, unknown> = { status: next, updated_at: new Date().toISOString() };
  if (next === "fulfilled") {
    update.fulfilled_by = session.userId;
    update.fulfilled_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin.from("av_orders").update(update).eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/targets");
  return { ok: true };
}
