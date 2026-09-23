import { supabaseAdmin } from "./supabase-admin";

export type EffectiveTarget = { amount: number; setFor: string };

/**
 * A target the owner sets for a rep stays in effect for every month after
 * it, until the owner sets a new one — no need to re-enter the same number
 * every month. "Effective for monthDate" (a YYYY-MM-01 string) means the
 * latest av_targets row for that rep with period_month <= monthDate; if the
 * owner sets one for, say, November, it also becomes December's target,
 * January's, and so on, until a newer row exists.
 *
 * Pass `repIds: null` to resolve every rep with any target history at or
 * before monthDate (used for the owner's all-reps dashboard/targets view).
 */
export async function getEffectiveTargets(
  repIds: string[] | null,
  monthDate: string,
): Promise<Map<string, EffectiveTarget>> {
  let query = supabaseAdmin
    .from("av_targets")
    .select("rep_id, period_month, target_amount")
    .lte("period_month", monthDate)
    .order("period_month", { ascending: false });
  if (repIds) query = query.in("rep_id", repIds);
  const { data } = await query;

  const result = new Map<string, EffectiveTarget>();
  for (const row of data ?? []) {
    // Rows are ordered newest-first, so the first one seen per rep is the
    // latest that's <= monthDate — i.e. the effective one.
    if (result.has(row.rep_id)) continue;
    result.set(row.rep_id, { amount: row.target_amount, setFor: row.period_month });
  }
  return result;
}
