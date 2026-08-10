"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createAdvance(formData: FormData) {
  const session = (await getSession())!;
  const customerId = String(formData.get("customer_id") || "");
  const amount = Number(formData.get("amount") || 0);
  if (!customerId || !amount) return;
  await supabaseAdmin.from("av_advances").insert({ customer_id: customerId, rep_id: session.userId, amount, status: "pending" });
  revalidatePath("/advances");
}

export async function settleAdvance(id: string) {
  await supabaseAdmin.from("av_advances").update({ status: "settled", settled_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/advances");
}
