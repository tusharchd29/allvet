"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createTravelLog(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const travel_date =
    String(formData.get("travel_date") || "") || new Date().toISOString().slice(0, 10);
  const start_km = Number(formData.get("start_km") || 0);
  const end_km = Number(formData.get("end_km") || 0);

  if (end_km < start_km) throw new Error("End km must be greater than start km");

  const { error } = await supabaseAdmin.from("av_travel_logs").insert({
    rep_id: session.userId,
    travel_date,
    start_km,
    end_km,
    distance_km: end_km - start_km,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/travel");
  redirect("/travel");
}
