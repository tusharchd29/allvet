"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createTourPlan(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const week_start = String(formData.get("week_start") || "");
  const zone = String(formData.get("zone") || "").trim() || null;
  const plan_notes = String(formData.get("plan_notes") || "").trim() || null;

  if (!week_start) return { ok: false, message: "Week is required" };

  const { error } = await supabaseAdmin.from("av_tours").insert({
    rep_id: session.userId,
    week_start,
    zone,
    plan_notes,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/tours");
  return { ok: true };
}

/** True if this session may act on the given tour — the owner may touch
 * any tour, a rep only their own. Used before every write to av_tour_stops,
 * since those don't go through the generic rep-scoped updateEntry path. */
async function canActOnTour(session: { role: string; userId: string }, tourId: string) {
  if (session.role === "owner") return true;
  const { data: tour } = await supabaseAdmin
    .from("av_tours")
    .select("rep_id")
    .eq("id", tourId)
    .maybeSingle();
  return !!tour && tour.rep_id === session.userId;
}

export async function createTourStop(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const tour_id = String(formData.get("tour_id") || "");
  const customer_id = String(formData.get("customer_id") || "") || null;
  const planned_date = String(formData.get("planned_date") || "");
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!tour_id || !planned_date) return { ok: false, message: "A planned date is required" };
  if (!(await canActOnTour(session, tour_id))) {
    return { ok: false, message: "Tour plan not found" };
  }

  const { error } = await supabaseAdmin
    .from("av_tour_stops")
    .insert({ tour_id, customer_id, planned_date, notes });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/tours");
  return { ok: true };
}

export async function toggleTourStop(stopId: string, tourId: string, completed: boolean) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await canActOnTour(session, tourId))) return { ok: false, message: "Not found" };

  const { error } = await supabaseAdmin
    .from("av_tour_stops")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", stopId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/tours");
  return { ok: true };
}

export async function deleteTourStop(stopId: string, tourId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await canActOnTour(session, tourId))) return { ok: false, message: "Not found" };

  const { error } = await supabaseAdmin.from("av_tour_stops").delete().eq("id", stopId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/tours");
  return { ok: true };
}
