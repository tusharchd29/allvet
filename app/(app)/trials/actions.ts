"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createTrial(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer_id = String(formData.get("customer_id") || "");
  const product = String(formData.get("product") || "").trim();
  const trial_date =
    String(formData.get("trial_date") || "") || new Date().toISOString().slice(0, 10);
  const outcome_notes = String(formData.get("outcome_notes") || "").trim() || null;

  if (!customer_id || !product) throw new Error("Customer and product are required");

  const { error } = await supabaseAdmin.from("av_product_trials").insert({
    customer_id,
    rep_id: session.userId,
    product,
    trial_date,
    outcome_notes,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/trials");
  redirect("/trials");
}
