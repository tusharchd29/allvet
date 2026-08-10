import { supabaseAdmin } from "./supabase-admin";
import { Session } from "./session";

// Every read/write in this file takes the session explicitly and scopes
// the query by it — owners see all reps' rows, reps see only their own.
// This is application-level authorization (not DB-level RLS), since auth
// here is a custom PIN system rather than Supabase Auth.

export async function getRepScope(session: Session) {
  return session.role === "owner" ? null : session.userId;
}

export async function getDashboardStats(session: Session) {
  const repId = await getRepScope(session);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, status, rep_id, amount", { count: "exact" })
    .gte("created_at", startOfMonth.toISOString());
  if (repId) ordersQuery = ordersQuery.eq("rep_id", repId);
  const { data: orders } = await ordersQuery;

  const fulfilled = (orders || []).filter((o) => o.status === "fulfilled");
  const pipeline = (orders || []).filter((o) => o.status === "confirmed" || o.status === "dispatched");

  let visitsQuery = supabaseAdmin
    .from("av_visits")
    .select("id, rep_id, visit_date", { count: "exact" })
    .gte("visit_date", startOfMonth.toISOString().slice(0, 10));
  if (repId) visitsQuery = visitsQuery.eq("rep_id", repId);
  const { count: visitsCount } = await visitsQuery;

  let targetsQuery = supabaseAdmin.from("av_targets").select("rep_id, target_amount, period_month");
  if (repId) targetsQuery = targetsQuery.eq("rep_id", repId);
  const thisMonth = startOfMonth.toISOString().slice(0, 10);
  targetsQuery = targetsQuery.eq("period_month", thisMonth);
  const { data: targets } = await targetsQuery;

  const targetTotal = (targets || []).reduce((sum, t) => sum + Number(t.target_amount || 0), 0);
  const fulfilledTotal = fulfilled.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const achievement = targetTotal > 0 ? Math.round((fulfilledTotal / targetTotal) * 100) : null;

  let repBreakdown: { repId: string; name: string; fulfilled: number; target: number }[] = [];
  if (session.role === "owner") {
    const { data: reps } = await supabaseAdmin.from("av_users").select("id, name").eq("role", "rep").eq("active", true);
    repBreakdown = (reps || []).map((r) => {
      const repFulfilled = fulfilled.filter((o) => o.rep_id === r.id).reduce((s, o) => s + Number(o.amount || 0), 0);
      const repTarget = (targets || []).filter((t) => t.rep_id === r.id).reduce((s, t) => s + Number(t.target_amount || 0), 0);
      return { repId: r.id, name: r.name, fulfilled: repFulfilled, target: repTarget };
    });
  }

  return {
    visitsCount: visitsCount || 0,
    fulfilledCount: fulfilled.length,
    fulfilledTotal,
    pipelineCount: pipeline.length,
    targetTotal,
    achievement,
    repBreakdown,
  };
}

export async function getRecentActivity(session: Session, limit = 8) {
  const repId = await getRepScope(session);
  let q = supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, created_at, av_customers(name), av_users(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (repId) q = q.eq("rep_id", repId);
  const { data } = await q;
  return data || [];
}
