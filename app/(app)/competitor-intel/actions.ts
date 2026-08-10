"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createCompetitorNote(formData: FormData) {
  const session = (await getSession())!;
  const customerId = String(formData.get("customer_id") || "");
  const competitorName = String(formData.get("competitor_name") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  if (!customerId || !competitorName) return;
  await supabaseAdmin.from("av_competitor_intel").insert({ customer_id: customerId, rep_id: session.userId, competitor_name: competitorName, notes: notes || null });
  revalidatePath("/competitor-intel");
}
