"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createCompetitorIntel(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer_id = String(formData.get("customer_id") || "");
  const competitor_name = String(formData.get("competitor_name") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!customer_id || !competitor_name) {
    throw new Error("Customer and competitor name are required");
  }

  const { error } = await supabaseAdmin.from("av_competitor_intel").insert({
    customer_id,
    rep_id: session.userId,
    competitor_name,
    notes,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/competitor-intel");
  redirect("/competitor-intel");
}
