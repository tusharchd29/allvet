import { supabaseAdmin } from "./supabase-admin";
import type { Session } from "./session";
import type { DateRange } from "./date-range";
import { dayStart, dayEnd } from "./date-range";
import { getEffectiveTargets } from "./targets";

function currentMonthStart() {
  return `${new Date().toISOString().slice(0, 7)}-01`;
}

export function getRepScope(session: Session) {
  return session.role === "owner" ? null : session.userId;
}

export async function getDashboardStats(session: Session, range?: DateRange) {
  const repId = getRepScope(session);

  const visitsQuery = supabaseAdmin
    .from("av_visits")
    .select("*", { count: "exact", head: true });
  if (repId) visitsQuery.eq("rep_id", repId);
  if (range?.from) visitsQuery.gte("visit_date", range.from);
  if (range?.to) visitsQuery.lte("visit_date", range.to);

  const ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, status, amount, rep_id");
  if (repId) ordersQuery.eq("rep_id", repId);
  if (range?.from) ordersQuery.gte("created_at", dayStart(range.from));
  if (range?.to) ordersQuery.lte("created_at", dayEnd(range.to));

  const customersQuery = supabaseAdmin
    .from("av_customers")
    .select("*", { count: "exact", head: true });
  if (repId) customersQuery.eq("rep_id", repId);

  const repUsersQuery =
    session.role === "owner"
      ? supabaseAdmin.from("av_users").select("id, name, role").eq("role", "rep")
      : null;

  const [{ count: visitsCount }, { data: orders }, { count: customersCount }, repUsersResult] =
    await Promise.all([visitsQuery, ordersQuery, customersQuery, repUsersQuery]);
  const users = repUsersResult?.data ?? [];

  const fulfilledOrders = (orders ?? []).filter((o) => o.status === "fulfilled");
  const fulfilledTotal = fulfilledOrders.reduce(
    (sum, o) => sum + (o.amount ?? 0),
    0,
  );
  const pipelineCount = (orders ?? []).filter(
    (o) => o.status !== "fulfilled",
  ).length;

  // Targets are a monthly figure and carry forward until changed (see
  // lib/targets.ts) — "this month" for the dashboard is always the current
  // calendar month, independent of whatever date range the person has
  // filtered the rest of the dashboard to.
  const thisMonth = currentMonthStart();
  const targetRepIds = repId ? [repId] : users.map((u) => u.id);
  const effectiveTargets = await getEffectiveTargets(targetRepIds, thisMonth);
  const targetTotal = Array.from(effectiveTargets.values()).reduce(
    (sum, t) => sum + t.amount,
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
    repBreakdown = users.map((u) => {
      const userOrders = (orders ?? []).filter(
        (o) => o.rep_id === u.id && o.status === "fulfilled",
      );
      const fulfilled = userOrders.reduce((sum, o) => sum + (o.amount ?? 0), 0);
      const target = effectiveTargets.get(u.id)?.amount ?? 0;
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

export type RepReconciliation = {
  repId: string;
  name: string;
  advanced: number;
  spent: number;
  balance: number;
};

/**
 * Cash advances given to reps (av_rep_advances) vs. what they've actually
 * logged in av_expenses — the balance is what's left of the advance
 * (positive) or what the rep is owed back (negative), all-time. Owner sees
 * every rep; a rep sees only their own row.
 */
export async function getRepAdvanceReconciliation(session: Session): Promise<{
  reps: RepReconciliation[];
  entries: Array<{
    id: string;
    rep_id: string;
    amount: number;
    purpose: string | null;
    given_at: string;
    repName: string;
  }>;
}> {
  const repId = getRepScope(session);

  const advancesQuery = supabaseAdmin
    .from("av_rep_advances")
    .select("id, rep_id, amount, purpose, given_at, av_users(name)")
    .order("given_at", { ascending: false });
  if (repId) advancesQuery.eq("rep_id", repId);

  const expensesQuery = supabaseAdmin.from("av_expenses").select("rep_id, amount");
  if (repId) expensesQuery.eq("rep_id", repId);

  const [{ data: advances }, { data: expenses }] = await Promise.all([advancesQuery, expensesQuery]);

  const advancedByRep = new Map<string, number>();
  for (const a of advances ?? []) {
    advancedByRep.set(a.rep_id, (advancedByRep.get(a.rep_id) ?? 0) + a.amount);
  }
  const spentByRep = new Map<string, number>();
  for (const e of expenses ?? []) {
    spentByRep.set(e.rep_id, (spentByRep.get(e.rep_id) ?? 0) + e.amount);
  }

  let reps: RepReconciliation[];
  if (session.role === "owner") {
    const { data: users } = await supabaseAdmin.from("av_users").select("id, name").eq("role", "rep");
    reps = (users ?? []).map((u) => {
      const advanced = advancedByRep.get(u.id) ?? 0;
      const spent = spentByRep.get(u.id) ?? 0;
      return { repId: u.id, name: u.name, advanced, spent, balance: advanced - spent };
    });
  } else {
    const advanced = advancedByRep.get(session.userId) ?? 0;
    const spent = spentByRep.get(session.userId) ?? 0;
    reps = [{ repId: session.userId, name: session.name, advanced, spent, balance: advanced - spent }];
  }

  const entries = (advances ?? []).map((a) => ({
    id: a.id as string,
    rep_id: a.rep_id as string,
    amount: a.amount as number,
    purpose: a.purpose as string | null,
    given_at: a.given_at as string,
    // @ts-expect-error joined relation
    repName: (a.av_users?.name as string) ?? "—",
  }));

  return { reps, entries };
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
