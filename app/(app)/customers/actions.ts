"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createCustomer(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const segment = String(formData.get("segment") || "").trim() || null;
  const zone = String(formData.get("zone") || "").trim() || null;
  const latRaw = String(formData.get("latitude") || "").trim();
  const lngRaw = String(formData.get("longitude") || "").trim();
  const latitude = latRaw ? Number(latRaw) : null;
  const longitude = lngRaw ? Number(lngRaw) : null;

  if (!name) throw new Error("Name is required");

  if (segment) {
    await supabaseAdmin.from("av_segments").upsert({ name: segment }, { onConflict: "name" });
  }

  const { error } = await supabaseAdmin.from("av_customers").insert({
    name,
    phone,
    address,
    segment,
    zone,
    latitude,
    longitude,
    rep_id: session.userId,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/customers");
  redirect("/customers");
}
