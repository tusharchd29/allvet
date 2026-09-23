"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createBrochure(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/brochures");

  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();

  if (!title || !url) throw new Error("Title and link are required");

  const { error } = await supabaseAdmin.from("av_brochures").insert({ title, url });
  if (error) throw new Error(error.message);

  revalidatePath("/brochures");
  redirect("/brochures");
}
