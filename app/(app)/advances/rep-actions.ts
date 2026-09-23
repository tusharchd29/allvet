"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

/**
 * Records cash the company gives A REP to cover field expenses (distinct
 * from av_advances, which is money advanced to a customer). Owner-only —
 * this is a financial disbursement, not something a rep logs for
 * themselves. Reconciliation against what the rep has actually spent
 * (av_expenses) is computed at read time in lib/data.ts.
 */
export async function createRepAdvance(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/advances");

  const rep_id = String(formData.get("rep_id") || "");
  const amount = Number(formData.get("amount") || 0);
  const purpose = String(formData.get("purpose") || "").trim() || null;
  const given_at = String(formData.get("given_at") || "") || new Date().toISOString().slice(0, 10);

  if (!rep_id || !amount || amount <= 0) {
    return { ok: false, message: "Rep and a positive amount are required" };
  }

  const { error } = await supabaseAdmin
    .from("av_rep_advances")
    .insert({ rep_id, amount, purpose, given_at });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/advances");
  return { ok: true };
}
