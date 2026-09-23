"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createProduct(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim() || null;
  const default_unit = String(formData.get("default_unit") || "").trim() || null;
  const priceRaw = String(formData.get("default_price") || "").trim();
  const default_price = priceRaw ? Number(priceRaw) : null;

  if (!name) return { ok: false, message: "Product name is required" };

  const { error } = await supabaseAdmin.from("av_products").insert({
    name,
    category,
    default_unit,
    default_price,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/products");
  revalidatePath("/orders/new");
  return { ok: true };
}
