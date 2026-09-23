"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

/**
 * A rep submits a claim for cash the company owes them back, when their
 * field spending (av_expenses) has run ahead of the cash advances they were
 * given (av_rep_advances) — the negative-balance case surfaced by
 * getRepAdvanceReconciliation in lib/data.ts. Mirrors asm-os's "submit
 * excess as a claim" feature. Always filed against the submitting rep —
 * there's no rep_id form field, so this can't be used to claim on behalf
 * of (or impersonate) another rep.
 */
export async function submitClaim(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const amount = Number(formData.get("amount") || 0);
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!amount || amount <= 0) {
    return { ok: false, message: "Enter a positive amount" };
  }

  const { error } = await supabaseAdmin
    .from("av_rep_claims")
    .insert({ rep_id: session.userId, amount, notes, status: "pending" });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/advances");
  return { ok: true };
}

const NEXT_CLAIM_STATUS: Record<string, string | null> = {
  pending: "approved",
  approved: "paid",
  paid: null,
};

/** Owner-only — moves a claim from pending → approved → paid. */
export async function advanceClaimStatus(claimId: string, currentStatus: string) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return { ok: false, message: "Not allowed" };
  }

  const next = NEXT_CLAIM_STATUS[currentStatus];
  if (!next) return { ok: false, message: "Claim is already paid" };

  const update: Record<string, unknown> = { status: next };
  if (next === "paid") update.resolved_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from("av_rep_claims").update(update).eq("id", claimId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/advances");
  return { ok: true };
}
