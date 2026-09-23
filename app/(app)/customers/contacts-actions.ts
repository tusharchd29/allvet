"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

/** True if this session may act on the given customer — owner may touch
 * any customer, a rep only their own. Mirrors canActOnTour in
 * app/(app)/tours/actions.ts, since contacts don't go through the generic
 * rep-scoped updateEntry path. */
async function canActOnCustomer(session: { role: string; userId: string }, customerId: string) {
  if (session.role === "owner") return true;
  const { data: customer } = await supabaseAdmin
    .from("av_customers")
    .select("rep_id")
    .eq("id", customerId)
    .maybeSingle();
  return !!customer && customer.rep_id === session.userId;
}

export async function createContact(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer_id = String(formData.get("customer_id") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!customer_id || !name) return { ok: false, message: "Name is required" };
  if (!(await canActOnCustomer(session, customer_id))) {
    return { ok: false, message: "Customer not found" };
  }

  const { error } = await supabaseAdmin
    .from("av_customer_contacts")
    .insert({ customer_id, name, role, phone });
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/customers/${customer_id}`);
  return { ok: true };
}

export async function deleteContact(contactId: string, customerId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await canActOnCustomer(session, customerId))) {
    return { ok: false, message: "Customer not found" };
  }

  const { error } = await supabaseAdmin.from("av_customer_contacts").delete().eq("id", contactId);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/customers/${customerId}`);
  return { ok: true };
}
