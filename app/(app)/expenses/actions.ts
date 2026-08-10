"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
  const session = (await getSession())!;
  const category = String(formData.get("category") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const note = String(formData.get("note") || "").trim();
  if (!category || !amount) return;
  await supabaseAdmin.from("av_expenses").insert({
    rep_id: session.userId,
    category,
    amount,
    note: note || null,
    expense_date: new Date().toISOString().slice(0, 10),
  });
  revalidatePath("/expenses");
}
