"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

// Tables editable through the generic inline-edit widget. Anything not
// listed here is refused, even if the caller somehow supplies its name.
const EDITABLE_TABLES = new Set([
  "av_customers",
  "av_visits",
  "av_orders",
  "av_advances",
  "av_expenses",
  "av_tours",
  "av_travel_logs",
  "av_product_trials",
  "av_competitor_intel",
  "av_brochures",
]);

export async function updateEntry(
  table: string,
  id: string,
  data: Record<string, unknown>,
  revalidate: string[] = [],
) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!EDITABLE_TABLES.has(table)) {
    throw new Error("This record type can't be edited.");
  }
  if (!id) throw new Error("Missing record id");

  const { error } = await supabaseAdmin.from(table).update(data).eq("id", id);
  if (error) throw new Error(error.message);

  for (const path of revalidate) {
    revalidatePath(path);
  }
  return { ok: true };
}

export async function deleteEntry(table: string, id: string, revalidate: string[] = []) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!EDITABLE_TABLES.has(table)) {
    throw new Error("This record type can't be deleted.");
  }
  if (!id) throw new Error("Missing record id");

  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);

  for (const path of revalidate) {
    revalidatePath(path);
  }
  return { ok: true };
}
