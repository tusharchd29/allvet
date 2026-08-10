"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCustomer(formData: FormData) {
  const session = (await getSession())!;
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const segment = String(formData.get("segment") || "").trim();

  if (!name) return;

  if (segment) {
    await supabaseAdmin.from("av_segments").upsert({ name: segment }, { onConflict: "name" });
  }

  await supabaseAdmin.from("av_customers").insert({
    name,
    phone: phone || null,
    address: address || null,
    segment: segment || null,
    rep_id: session.userId,
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function getOrCreateSegments() {
  const { data } = await supabaseAdmin.from("av_segments").select("name").order("name");
  return (data || []).map((d) => d.name);
}

export async function addSegment(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  await supabaseAdmin.from("av_segments").upsert({ name: trimmed }, { onConflict: "name" });
  revalidatePath("/customers/new");
}
