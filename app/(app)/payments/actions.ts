"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function recordPayment(
  orderId: string,
  customerId: string,
  amount: number,
  notes?: string,
) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!amount || amount <= 0) {
    throw new Error("Enter a valid amount");
  }

  const { error } = await supabaseAdmin.from("av_payments").insert({
    order_id: orderId,
    customer_id: customerId,
    rep_id: session.userId,
    amount,
    notes: notes?.trim() || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updatePaymentDueDate(orderId: string, dueDate: string | null) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { error } = await supabaseAdmin
    .from("av_orders")
    .update({ payment_due_date: dueDate })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/payments");
  return { ok: true };
}
