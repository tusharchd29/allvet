"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createTrial(formData: FormData) {
  const session = (await getSession())!;
  const customerId = String(formData.get("customer_id") || "");
  const product = String(formData.get("product") || "").trim();
  const outcome = String(formData.get("outcome_notes") || "").trim();
  if (!customerId || !product) return;
  await supabaseAdmin.from("av_product_trials").insert({
    customer_id: customerId, rep_id: session.userId, product,
    trial_date: new Date().toISOString().slice(0, 10), outcome_notes: outcome || null,
  });
  revalidatePath("/trials");
}
