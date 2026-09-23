"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

export async function createExpense(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const category = String(formData.get("category") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const note = String(formData.get("note") || "").trim() || null;
  const expense_date =
    String(formData.get("expense_date") || "") || new Date().toISOString().slice(0, 10);

  if (!category || amount <= 0) throw new Error("Category and amount are required");

  const { error } = await supabaseAdmin.from("av_expenses").insert({
    rep_id: session.userId,
    category,
    amount,
    note,
    expense_date,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/expenses");
  redirect("/expenses");
}
