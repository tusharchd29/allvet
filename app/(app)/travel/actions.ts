"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createTravelLog(formData: FormData) {
  const session = (await getSession())!;
  const startKm = Number(formData.get("start_km") || 0);
  const endKm = Number(formData.get("end_km") || 0);
  if (!startKm || !endKm || endKm < startKm) return;
  await supabaseAdmin.from("av_travel_logs").insert({
    rep_id: session.userId,
    travel_date: new Date().toISOString().slice(0, 10),
    start_km: startKm,
    end_km: endKm,
    distance_km: endKm - startKm,
  });
  revalidatePath("/travel");
}
