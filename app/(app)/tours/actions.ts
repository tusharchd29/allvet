"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createTourPlan(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const week_start = String(formData.get("week_start") || "");
  const plan_notes = String(formData.get("plan_notes") || "").trim();

  if (!week_start || !plan_notes) throw new Error("Week and plan are required");

  const { error } = await supabaseAdmin.from("av_tours").insert({
    rep_id: session.userId,
    week_start,
    plan_notes,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/tours");
  redirect("/tours");
}
