"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { attachPhotoIfPresent } from "@/lib/photos";

export async function createVisit(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer_id = String(formData.get("customer_id") || "");
  const purpose = String(formData.get("purpose") || "").trim() || null;
  const discussion_summary =
    String(formData.get("discussion_summary") || "").trim() || null;
  const follow_up_required = formData.get("follow_up_required") === "on";
  const next_visit_date = String(formData.get("next_visit_date") || "") || null;
  const visit_date =
    String(formData.get("visit_date") || "") || new Date().toISOString().slice(0, 10);
  const latRaw = String(formData.get("latitude") || "").trim();
  const lngRaw = String(formData.get("longitude") || "").trim();
  const latitude = latRaw ? Number(latRaw) : null;
  const longitude = lngRaw ? Number(lngRaw) : null;

  if (!customer_id) throw new Error("Customer is required");

  const { data: inserted, error } = await supabaseAdmin
    .from("av_visits")
    .insert({
      customer_id,
      rep_id: session.userId,
      visit_date,
      purpose,
      discussion_summary,
      follow_up_required,
      next_visit_date,
      latitude,
      longitude,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await attachPhotoIfPresent(formData, "photo", "visit", inserted.id, session.userId);

  revalidatePath("/visits");
  redirect("/visits");
}
