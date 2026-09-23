"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { attachPhotoIfPresent } from "@/lib/photos";

export async function createTravelLog(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const travel_date =
    String(formData.get("travel_date") || "") || new Date().toISOString().slice(0, 10);
  const start_km = Number(formData.get("start_km") || 0);
  const end_km = Number(formData.get("end_km") || 0);

  if (end_km < start_km) throw new Error("End km must be greater than start km");

  const { data: inserted, error } = await supabaseAdmin
    .from("av_travel_logs")
    .insert({
      rep_id: session.userId,
      travel_date,
      start_km,
      end_km,
      distance_km: end_km - start_km,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await attachPhotoIfPresent(formData, "photo", "travel_log", inserted.id, session.userId);

  revalidatePath("/travel");
  redirect("/travel");
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
