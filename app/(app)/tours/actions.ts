"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createTourPlan(formData: FormData) {
  const session = (await getSession())!;
  const weekStart = String(formData.get("week_start") || "");
  const planNotes = String(formData.get("plan_notes") || "").trim();
  if (!weekStart || !planNotes) return;
  await supabaseAdmin.from("av_tours").insert({ rep_id: session.userId, week_start: weekStart, plan_notes: planNotes });
  revalidatePath("/tours");
}
