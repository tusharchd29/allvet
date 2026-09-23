"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { attachPhotoIfPresent } from "@/lib/photos";
import { getRateForDate } from "@/lib/rates";

export async function createTravelLog(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const travel_date =
    String(formData.get("travel_date") || "") || new Date().toISOString().slice(0, 10);
  const start_km = Number(formData.get("start_km") || 0);
  const end_km = Number(formData.get("end_km") || 0);

  if (end_km < start_km) {
    return { ok: false, message: "End km must be greater than start km" };
  }

  const rate_per_km = await getRateForDate(travel_date);

  const { data: inserted, error } = await supabaseAdmin
    .from("av_travel_logs")
    .insert({
      rep_id: session.userId,
      travel_date,
      start_km,
      end_km,
      distance_km: end_km - start_km,
      rate_per_km,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  try {
    await attachPhotoIfPresent(formData, "photo", "travel_log", inserted.id, session.userId);
  } catch (err) {
    revalidatePath("/travel");
    return {
      ok: false,
      message: `Travel log saved, but the odometer photo didn't upload: ${err instanceof Error ? err.message : "unknown error"}.`,
    };
  }

  revalidatePath("/travel");
  return { ok: true };
}

/**
 * Owner sets a new reimbursement rate effective from a given date. Upserts
 * on `effective_from` so correcting today's rate (rather than backdating a
 * new period) doesn't create duplicate rows.
 */
export async function setRatePeriod(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/travel");

  const rate_per_km = Number(formData.get("rate_per_km") || 0);
  const effective_from =
    String(formData.get("effective_from") || "") || new Date().toISOString().slice(0, 10);

  if (!rate_per_km || rate_per_km <= 0) {
    return { ok: false, message: "Enter a rate greater than zero" };
  }

  const { error } = await supabaseAdmin
    .from("av_rate_periods")
    .upsert({ rate_per_km, effective_from }, { onConflict: "effective_from" });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/travel");
  return { ok: true };
}

export async function updateTravelLog(
  id: string,
  data: { travel_date: string; start_km: number; end_km: number },
) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (data.end_km < data.start_km) throw new Error("End km must be greater than start km");

  const { error } = await supabaseAdmin
    .from("av_travel_logs")
    .update({
      travel_date: data.travel_date,
      start_km: data.start_km,
      end_km: data.end_km,
      distance_km: data.end_km - data.start_km,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/travel");
  return { ok: true };
}
