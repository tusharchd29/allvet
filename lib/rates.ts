import { supabaseAdmin } from "./supabase-admin";

/**
 * Date-aware km reimbursement rates (mirrors the `asm_rate_periods` pattern
 * from asm-os). The rate effective for a given date is whichever period has
 * the latest `effective_from` on or before that date — so a rate change
 * (e.g. a fuel price adjustment) only affects trips logged from that date
 * forward, never rewrites past ones. Travel logs snapshot the resolved rate
 * at creation time (`av_travel_logs.rate_per_km`) rather than joining this
 * table at read time, for the same reason.
 */
export async function getRateForDate(date: string): Promise<number | null> {
  const { data } = await supabaseAdmin
    .from("av_rate_periods")
    .select("rate_per_km")
    .lte("effective_from", date)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.rate_per_km ?? null;
}

export async function getCurrentRate(): Promise<{ rate_per_km: number; effective_from: string } | null> {
  const { data } = await supabaseAdmin
    .from("av_rate_periods")
    .select("rate_per_km, effective_from")
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
