"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function setTarget(formData: FormData) {
  const session = (await getSession())!;
  if (session.role !== "owner") return;

  const repId = String(formData.get("rep_id") || "");
  const amount = Number(formData.get("target_amount") || 0);
  const periodMonth = new Date();
  periodMonth.setDate(1);
  const period = periodMonth.toISOString().slice(0, 10);

  if (!repId || !amount) return;

  await supabaseAdmin
    .from("av_targets")
    .upsert({ rep_id: repId, period_month: period, target_amount: amount }, { onConflict: "rep_id,period_month" });

  revalidatePath("/targets");
  revalidatePath("/dashboard");
}
