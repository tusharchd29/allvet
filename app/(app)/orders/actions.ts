"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@/lib/utils";

export async function createOrder(formData: FormData) {
  const session = (await getSession())!;
  const customerId = String(formData.get("customer_id") || "");
  const product = String(formData.get("product") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const notes = String(formData.get("notes") || "").trim();

  if (!customerId || !product) return;

  await supabaseAdmin.from("av_orders").insert({
    customer_id: customerId,
    rep_id: session.userId,
    product,
    quantity: quantity || null,
    amount: amount || null,
    notes: notes || null,
    status: "pending",
  });

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  redirect("/orders");
}

// Both rep and owner can advance status — no approval gate (see plan).
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = (await getSession())!;
  const patch: Record<string, unknown> = { status };
  if (status === "fulfilled") {
    patch.fulfilled_by = session.userId;
    patch.fulfilled_at = new Date().toISOString();
  }
  await supabaseAdmin.from("av_orders").update(patch).eq("id", orderId);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}
