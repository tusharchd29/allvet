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

  const customersQuery = supabaseAdmin
    .from("av_customers")
    .select("*", { count: "exact", head: true });
  if (repId) customersQuery.eq("rep_id", repId);

  const [{ count: visitsCount }, { data: orders }, { data: targets }, { count: customersCount }] =
    await Promise.all([visitsQuery, ordersQuery, targetsQuery, customersQuery]);

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
    customersCount: customersCount ?? 0,
    fulfilledCount: fulfilledOrders.length,
    fulfilledTotal,
    pipelineCount,
    targetTotal,
    achievementPct,
    repBreakdown,
  };
}

export async function getPaymentDues(session: Session) {
  const repId = getRepScope(session);

  const ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, amount, payment_due_date")
    .eq("status", "fulfilled")
    .not("amount", "is", null);
  if (repId) ordersQuery.eq("rep_id", repId);
  const { data: orders } = await ordersQuery;

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: payments } = orderIds.length
    ? await supabaseAdmin.from("av_payments").select("order_id, amount").in("order_id", orderIds)
    : { data: [] as { order_id: string; amount: number }[] };

  const paidByOrder = new Map<string, number>();
  for (const p of payments ?? []) {
    paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) ?? 0) + p.amount);
  }

  const today = new Date().setHours(0, 0, 0, 0);
  let totalDue = 0;
  let overdueTotal = 0;
  let outstandingCount = 0;
  let overdueCount = 0;

  for (const o of orders ?? []) {
    const paid = paidByOrder.get(o.id) ?? 0;
    const due = Math.max((o.amount ?? 0) - paid, 0);
    if (due > 0) {
      totalDue += due;
      outstandingCount += 1;
      if (o.payment_due_date && new Date(o.payment_due_date).getTime() < today) {
        overdueTotal += due;
        overdueCount += 1;
      }
    }
  }

  return { totalDue, overdueTotal, outstandingCount, overdueCount };
}

export async function getMapCustomers(session: Session) {
  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_customers")
    .select("id, name, segment, zone, latitude, longitude")
    .not("latitude", "is", null)
    .not("longitude", "is", null);
  if (repId) query.eq("rep_id", repId);
  const { data } = await query;
  return data ?? [];
}

export async function getZoneBreakdown(session: Session) {
  const repId = getRepScope(session);
  const query = supabaseAdmin.from("av_customers").select("zone");
  if (repId) query.eq("rep_id", repId);
  const { data } = await query;

  const counts: Record<string, number> = { north: 0, central: 0, west: 0, south: 0, unassigned: 0 };
  for (const row of data ?? []) {
    const z = row.zone as string | null;
    counts[z && z in counts ? z : "unassigned"] += 1;
  }
  return counts;
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
