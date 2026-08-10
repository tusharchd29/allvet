"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function createBrochure(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (!title || !url) return;
  await supabaseAdmin.from("av_brochures").insert({ title, url });
  revalidatePath("/brochures");
}
