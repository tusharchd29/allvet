"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function setTarget(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/dashboard");

  const rep_id = String(formData.get("rep_id") || "");
  const target_amount = Number(formData.get("target_amount") || 0);
  const period_month = String(formData.get("period_month") || "");

  if (!rep_id || !period_month || target_amount <= 0) {
    throw new Error("All fields are required");
  }

  const { error } = await supabaseAdmin
    .from("av_targets")
    .upsert(
      { rep_id, period_month: `${period_month}-01`, target_amount },
      { onConflict: "rep_id,period_month" },
    );

  if (error) throw new Error(error.message);

  revalidatePath("/targets");
  revalidatePath("/dashboard");
}
