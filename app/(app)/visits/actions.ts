"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVisit(formData: FormData) {
  const session = (await getSession())!;
  const customerId = String(formData.get("customer_id") || "");
  const purpose = String(formData.get("purpose") || "").trim();
  const discussion = String(formData.get("discussion_summary") || "").trim();
  const followUp = formData.get("follow_up_required") === "on";
  const nextVisitDate = String(formData.get("next_visit_date") || "") || null;

  if (!customerId) return;

  await supabaseAdmin.from("av_visits").insert({
    customer_id: customerId,
    rep_id: session.userId,
    visit_date: new Date().toISOString().slice(0, 10),
    purpose: purpose || null,
    discussion_summary: discussion || null,
    follow_up_required: followUp,
    next_visit_date: nextVisitDate,
  });

  revalidatePath("/visits");
  revalidatePath("/dashboard");
  revalidatePath(`/customers/${customerId}`);
  redirect("/visits");
}
