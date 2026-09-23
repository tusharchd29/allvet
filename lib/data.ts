import { supabaseAdmin } from "./supabase-admin";
import type { Session } from "./session";

export function getRepScope(session: Session) {
  return session.role === "owner" ? null : session.userId;
}

export async function getDashboardStats(session: Session) {
  const repId = getRepScope(session);

  const visitsQuery = supabaseAdmin
    .from("av_visits")
    .select("*", { count: "exact", head: true });
  if (repId) visitsQuery.eq("rep_id", repId);

  const ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, status, amount, rep_id");
  if (repId) ordersQuery.eq("rep_id", repId);

  const targetsQuery = supabaseAdmin.from("av_targets").select("*");
  if (repId) targetsQuery.eq("rep_id", repId);

  const [{ count: visitsCount }, { data: orders }, { data: targets }] =
    await Promise.all([visitsQuery, ordersQuery, targetsQuery]);

  const fulfilledOrders = (orders ?? []).filter((o) => o.status === "fulfilled");
  const fulfilledTotal = fulfilledOrders.reduce(
    (sum, o) => sum + (o.amount ?? 0),
    0,
  );
  const pipelineCount = (orders ?? []).filter(
    (o) => o.status !== "fulfilled",
  ).length;

  const targetTotal = (targets ?? []).reduce(
    (sum, t) => sum + (t.target_amount ?? 0),
    0,
  );
  const achievementPct =
    targetTotal > 0
      ? Math.min(100, Math.round((fulfilledTotal / targetTotal) * 100))
      : 0;

  let repBreakdown: Array<{
    repId: string;
    name: string;
    fulfilled: number;
    target: number;
  }> = [];

  if (session.role === "owner") {
    const { data: users } = await supabaseAdmin
      .from("av_users")
      .select("id, name, role")
      .eq("role", "rep");

    repBreakdown = (users ?? []).map((u) => {
      const userOrders = (orders ?? []).filter(
        (o) => o.rep_id === u.id && o.status === "fulfilled",
      );
      const fulfilled = userOrders.reduce((sum, o) => sum + (o.amount ?? 0), 0);
      const target = (targets ?? [])
        .filter((t) => t.rep_id === u.id)
        .reduce((sum, t) => sum + (t.target_amount ?? 0), 0);
      return { repId: u.id, name: u.name, fulfilled, target };
    });
  }

  return {
    visitsCount: visitsCount ?? 0,
    fulfilledCount: fulfilledOrders.length,
    fulfilledTotal,
    pipelineCount,
    targetTotal,
    achievementPct,
    repBreakdown,
  };
}

export async function getRecentActivity(session: Session, limit = 8) {
  const repId = getRepScope(session);

  const visitsQuery = supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, av_customers(name)")
    .order("visit_date", { ascending: false })
    .limit(limit);
  if (repId) visitsQuery.eq("rep_id", repId);

  const ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, status, amount, created_at, av_customers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (repId) ordersQuery.eq("rep_id", repId);

  const [{ data: visits }, { data: orders }] = await Promise.all([
    visitsQuery,
    ordersQuery,
  ]);

  return { visits: visits ?? [], orders: orders ?? [] };
}
