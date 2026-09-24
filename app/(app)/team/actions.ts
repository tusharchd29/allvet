"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSession, getSession } from "@/lib/session";

/**
 * Renames a team member (owner or rep). Deliberately its own action rather
 * than routed through the generic updateEntry — av_users also holds `pin`
 * and `role`, and that path's REP_SCOPED_TABLES logic assumes a `rep_id`
 * column, which av_users doesn't have (a user IS the rep). Owner-only:
 * these are the names everyone else's orders, expenses, targets, and
 * reports show, not something a rep should self-serve edit.
 */
export async function updateUserName(userId: string, name: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") {
    return { ok: false, message: "Only the owner can rename team members." };
  }

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, message: "Name can't be empty." };
  if (trimmed.length > 60) return { ok: false, message: "Name is too long." };

  const { error } = await supabaseAdmin.from("av_users").update({ name: trimmed }).eq("id", userId);
  if (error) return { ok: false, message: error.message };

  // The owner's own name is also cached in their signed session cookie
  // (used for instant greetings without a DB round trip) — refresh it so a
  // self-rename shows up immediately instead of only after the next login.
  if (userId === session.userId) {
    await createSession({ ...session, name: trimmed });
  }

  // Names are read all over the app — dashboard greeting, orders/expenses
  // attribution, reports, advances, targets — so revalidate broadly rather
  // than just /team.
  revalidatePath("/", "layout");
  return { ok: true };
}
