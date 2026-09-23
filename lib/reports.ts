import { supabaseAdmin } from "./supabase-admin";
import { getRepScope } from "./data";
import { getEffectiveTargets } from "./targets";
import type { Session } from "./session";
import type { OrderStatus } from "./utils";

// The seven report types the owner can mix and match into one PDF. A rep
// always gets all of them for their own data; the owner additionally picks
// which reps to include (see resolveRepIds below).
export const REPORT_SECTIONS = [
  "visits",
  "expenses",
  "orders",
  "travel",
  "advances",
  "targets",
  "tours",
] as const;
export type ReportSection = (typeof REPORT_SECTIONS)[number];

export const REPORT_SECTION_LABEL: Record<ReportSection, string> = {
  visits: "Visits",
  expenses: "Expenses",
  orders: "Orders & payments",
  travel: "Travel & reimbursement",
  advances: "Advances & claims",
  targets: "Targets vs achievement",
  tours: "Tour coverage",
};

export type ReportCustomer = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

export type ReportVisit = {
  id: string;
  visitDate: string;
  purpose: string | null;
  discussionSummary: string | null;
  followUpRequired: boolean;
  nextVisitDate: string | null;
  customer: ReportCustomer | null;
  repName: string;
};

export type ReportOrder = {
  id: string;
  createdAt: string;
  product: string;
  quantity: string | null;
  amount: number | null;
  status: OrderStatus;
  paymentDueDate: string | null;
  paid: number;
  due: number;
  customer: ReportCustomer | null;
  repName: string;
};

export type ReportPayment = {
  id: string;
  createdAt: string;
  amount: number;
  notes: string | null;
  customer: ReportCustomer | null;
  repName: string;
};

export type ReportExpense = {
  id: string;
  expenseDate: string;
  category: string;
  amount: number;
  note: string | null;
  repName: string;
};

export type ReportAdvance = {
  id: string;
  createdAt: string;
  amount: number;
  status: "pending" | "settled";
  settledAt: string | null;
  customer: ReportCustomer | null;
  repName: string;
};

export type ReportTravelLog = {
  id: string;
  travelDate: string;
  distanceKm: number;
  ratePerKm: number | null;
  reimbursement: number;
  repName: string;
};

export type ReportRepAdvance = {
  id: string;
  givenAt: string;
  amount: number;
  purpose: string | null;
  repName: string;
};

export type ReportClaim = {
  id: string;
  createdAt: string;
  amount: number;
  status: "pending" | "approved" | "paid";
  notes: string | null;
  repName: string;
};

export type ReportTargetRow = {
  repId: string;
  repName: string;
  target: number;
  achieved: number;
  pct: number;
};

export type ReportTourStop = {
  id: string;
  customerName: string | null;
  plannedDate: string;
  completed: boolean;
};

export type ReportTour = {
  id: string;
  weekStart: string;
  zone: string | null;
  repName: string;
  stops: ReportTourStop[];
};

export type ReportData = {
  start: string;
  end: string;
  scopeLabel: string;
  sections: ReportSection[];
  visits: ReportVisit[];
  orders: ReportOrder[];
  payments: ReportPayment[];
  expenses: ReportExpense[];
  advances: ReportAdvance[];
  repAdvances: ReportRepAdvance[];
  claims: ReportClaim[];
  travelLogs: ReportTravelLog[];
  targets: ReportTargetRow[];
  tours: ReportTour[];
  totals: {
    fulfilledValue: number;
    collected: number;
    outstanding: number;
    overdue: number;
    expenses: number;
    advancesOutstanding: number;
    travelReimbursement: number;
    repAdvancesGiven: number;
    claimsPending: number;
  };
};

function dayStart(date: string) {
  return `${date}T00:00:00.000Z`;
}
function dayEnd(date: string) {
  return `${date}T23:59:59.999Z`;
}

/**
 * Which rep_ids a report should be scoped to. A rep always sees only their
 * own data. The owner can pick specific reps (multi-select) or leave it
 * unset for "whole team" — `null` means no rep filter at all (every rep).
 */
function resolveRepIds(session: Session, requestedRepIds: string[] | null): string[] | null {
  const ownScope = getRepScope(session);
  if (ownScope) return [ownScope];
  return requestedRepIds && requestedRepIds.length > 0 ? requestedRepIds : null;
}

export async function getReportData(
  session: Session,
  start: string,
  end: string,
  options?: { repIds?: string[] | null; sections?: ReportSection[] },
): Promise<ReportData> {
  const repIds = resolveRepIds(session, options?.repIds ?? null);
  const sections = options?.sections && options.sections.length > 0 ? options.sections : [...REPORT_SECTIONS];
  const want = (s: ReportSection) => sections.includes(s);

  const [usersRes, customersRes] = await Promise.all([
    supabaseAdmin.from("av_users").select("id, name"),
    supabaseAdmin.from("av_customers").select("id, name, latitude, longitude"),
  ]);
  const userName = new Map((usersRes.data ?? []).map((u) => [u.id, u.name as string]));
  const customerById = new Map(
    (customersRes.data ?? []).map((c) => [
      c.id,
      { id: c.id, name: c.name, latitude: c.latitude, longitude: c.longitude } as ReportCustomer,
    ]),
  );

  let visitsQuery = supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, discussion_summary, follow_up_required, next_visit_date, customer_id, rep_id")
    .gte("visit_date", start)
    .lte("visit_date", end)
    .order("visit_date", { ascending: true });
  if (repIds) visitsQuery = visitsQuery.in("rep_id", repIds);

  let ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, created_at, product, quantity, amount, status, payment_due_date, customer_id, rep_id")
    .gte("created_at", dayStart(start))
    .lte("created_at", dayEnd(end))
    .order("created_at", { ascending: true });
  if (repIds) ordersQuery = ordersQuery.in("rep_id", repIds);

  let paymentsQuery = supabaseAdmin
    .from("av_payments")
    .select("id, created_at, amount, notes, order_id, customer_id, rep_id")
    .gte("created_at", dayStart(start))
    .lte("created_at", dayEnd(end))
    .order("created_at", { ascending: true });
  if (repIds) paymentsQuery = paymentsQuery.in("rep_id", repIds);

  let expensesQuery = supabaseAdmin
    .from("av_expenses")
    .select("id, expense_date, category, amount, note, rep_id")
    .gte("expense_date", start)
    .lte("expense_date", end)
    .order("expense_date", { ascending: true });
  if (repIds) expensesQuery = expensesQuery.in("rep_id", repIds);

  let advancesQuery = supabaseAdmin
    .from("av_advances")
    .select("id, created_at, amount, status, settled_at, customer_id, rep_id")
    .gte("created_at", dayStart(start))
    .lte("created_at", dayEnd(end))
    .order("created_at", { ascending: true });
  if (repIds) advancesQuery = advancesQuery.in("rep_id", repIds);

  let repAdvancesQuery = supabaseAdmin
    .from("av_rep_advances")
    .select("id, given_at, amount, purpose, rep_id")
    .gte("given_at", start)
    .lte("given_at", end)
    .order("given_at", { ascending: true });
  if (repIds) repAdvancesQuery = repAdvancesQuery.in("rep_id", repIds);

  let claimsQuery = supabaseAdmin
    .from("av_rep_claims")
    .select("id, created_at, amount, status, notes, rep_id")
    .gte("created_at", dayStart(start))
    .lte("created_at", dayEnd(end))
    .order("created_at", { ascending: true });
  if (repIds) claimsQuery = claimsQuery.in("rep_id", repIds);

  let travelQuery = supabaseAdmin
    .from("av_travel_logs")
    .select("id, travel_date, distance_km, rate_per_km, rep_id")
    .gte("travel_date", start)
    .lte("travel_date", end)
    .order("travel_date", { ascending: true });
  if (repIds) travelQuery = travelQuery.in("rep_id", repIds);

  let toursQuery = supabaseAdmin
    .from("av_tours")
    .select("id, week_start, zone, rep_id")
    .gte("week_start", start)
    .lte("week_start", end)
    .order("week_start", { ascending: true });
  if (repIds) toursQuery = toursQuery.in("rep_id", repIds);

  const [
    visitsRes,
    ordersRes,
    paymentsRes,
    expensesRes,
    advancesRes,
    repAdvancesRes,
    claimsRes,
    travelRes,
    toursRes,
  ] = await Promise.all([
    visitsQuery,
    ordersQuery,
    paymentsQuery,
    expensesQuery,
    advancesQuery,
    repAdvancesQuery,
    claimsQuery,
    travelQuery,
    toursQuery,
  ]);

  const orderRows = ordersRes.data ?? [];
  const orderIds = orderRows.map((o) => o.id);

  // Payments against these orders (not just payments *recorded* in the
  // window) determine how much of each order is still due, so this is a
  // second, unscoped-by-date query.
  const { data: allPaymentsForOrders } = orderIds.length
    ? await supabaseAdmin.from("av_payments").select("order_id, amount").in("order_id", orderIds)
    : { data: [] as { order_id: string; amount: number }[] };
  const paidByOrder = new Map<string, number>();
  for (const p of allPaymentsForOrders ?? []) {
    paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) ?? 0) + p.amount);
  }

  const today = new Date().setHours(0, 0, 0, 0);

  const orders: ReportOrder[] = orderRows.map((o) => {
    const paid = paidByOrder.get(o.id) ?? 0;
    const due = Math.max((o.amount ?? 0) - paid, 0);
    return {
      id: o.id,
      createdAt: o.created_at,
      product: o.product,
      quantity: o.quantity,
      amount: o.amount,
      status: o.status as OrderStatus,
      paymentDueDate: o.payment_due_date,
      paid,
      due,
      customer: customerById.get(o.customer_id) ?? null,
      repName: userName.get(o.rep_id) ?? "—",
    };
  });

  const visits: ReportVisit[] = (visitsRes.data ?? []).map((v) => ({
    id: v.id,
    visitDate: v.visit_date,
    purpose: v.purpose,
    discussionSummary: v.discussion_summary,
    followUpRequired: Boolean(v.follow_up_required),
    nextVisitDate: v.next_visit_date,
    customer: customerById.get(v.customer_id) ?? null,
    repName: userName.get(v.rep_id) ?? "—",
  }));

  const payments: ReportPayment[] = (paymentsRes.data ?? []).map((p) => ({
    id: p.id,
    createdAt: p.created_at,
    amount: p.amount,
    notes: p.notes,
    customer: customerById.get(p.customer_id) ?? null,
    repName: userName.get(p.rep_id) ?? "—",
  }));

  const expenses: ReportExpense[] = (expensesRes.data ?? []).map((e) => ({
    id: e.id,
    expenseDate: e.expense_date,
    category: e.category,
    amount: e.amount,
    note: e.note,
    repName: userName.get(e.rep_id) ?? "—",
  }));

  const advances: ReportAdvance[] = (advancesRes.data ?? []).map((a) => ({
    id: a.id,
    createdAt: a.created_at,
    amount: a.amount,
    status: a.status,
    settledAt: a.settled_at,
    customer: customerById.get(a.customer_id) ?? null,
    repName: userName.get(a.rep_id) ?? "—",
  }));

  const repAdvances: ReportRepAdvance[] = (repAdvancesRes.data ?? []).map((a) => ({
    id: a.id,
    givenAt: a.given_at,
    amount: a.amount,
    purpose: a.purpose,
    repName: userName.get(a.rep_id) ?? "—",
  }));

  const claims: ReportClaim[] = (claimsRes.data ?? []).map((c) => ({
    id: c.id,
    createdAt: c.created_at,
    amount: c.amount,
    status: c.status,
    notes: c.notes,
    repName: userName.get(c.rep_id) ?? "—",
  }));

  const travelLogs: ReportTravelLog[] = (travelRes.data ?? []).map((t) => ({
    id: t.id,
    travelDate: t.travel_date,
    distanceKm: t.distance_km,
    ratePerKm: t.rate_per_km,
    reimbursement: t.rate_per_km != null ? Math.round(t.distance_km * t.rate_per_km * 100) / 100 : 0,
    repName: userName.get(t.rep_id) ?? "—",
  }));

  // Tour coverage — pull every stop for the tours found in range and
  // group by tour, so each tour shows its planned stops and how many were
  // actually completed.
  const tourRows = toursRes.data ?? [];
  const tourIds = tourRows.map((t) => t.id);
  const { data: stopRows } = want("tours") && tourIds.length
    ? await supabaseAdmin
        .from("av_tour_stops")
        .select("id, tour_id, customer_id, planned_date, completed")
        .in("tour_id", tourIds)
        .order("planned_date", { ascending: true })
    : { data: [] as { id: string; tour_id: string; customer_id: string | null; planned_date: string; completed: boolean }[] };
  const stopsByTour = new Map<string, ReportTourStop[]>();
  for (const s of stopRows ?? []) {
    const list = stopsByTour.get(s.tour_id) ?? [];
    list.push({
      id: s.id,
      customerName: s.customer_id ? customerById.get(s.customer_id)?.name ?? null : null,
      plannedDate: s.planned_date,
      completed: Boolean(s.completed),
    });
    stopsByTour.set(s.tour_id, list);
  }
  const tours: ReportTour[] = tourRows.map((t) => ({
    id: t.id,
    weekStart: t.week_start,
    zone: t.zone,
    repName: userName.get(t.rep_id) ?? "—",
    stops: stopsByTour.get(t.id) ?? [],
  }));

  // Targets vs achievement — effective target as of the report's start
  // month for each rep in scope, compared against what they actually
  // fulfilled inside the report's date range.
  const targetRepIds = repIds ?? Array.from(userName.keys());
  const monthDate = `${start.slice(0, 7)}-01`;
  const effectiveTargets = want("targets") ? await getEffectiveTargets(targetRepIds, monthDate) : new Map();
  const fulfilledByRep = new Map<string, number>();
  for (const o of orders) {
    if (o.status !== "fulfilled") continue;
    const repEntry = orderRows.find((r) => r.id === o.id);
    const repId = repEntry?.rep_id;
    if (!repId) continue;
    fulfilledByRep.set(repId, (fulfilledByRep.get(repId) ?? 0) + (o.amount ?? 0));
  }
  const targets: ReportTargetRow[] = targetRepIds
    .map((repId) => {
      const target = effectiveTargets.get(repId)?.amount ?? 0;
      const achieved = fulfilledByRep.get(repId) ?? 0;
      return {
        repId,
        repName: userName.get(repId) ?? "—",
        target,
        achieved,
        pct: target > 0 ? Math.min(999, Math.round((achieved / target) * 100)) : 0,
      };
    })
    .filter((t) => t.target > 0 || t.achieved > 0);

  const fulfilledOrders = orders.filter((o) => o.status === "fulfilled");
  const fulfilledValue = fulfilledOrders.reduce((s, o) => s + (o.amount ?? 0), 0);
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = fulfilledOrders.reduce((s, o) => s + o.due, 0);
  const overdue = fulfilledOrders
    .filter((o) => o.due > 0 && o.paymentDueDate && new Date(o.paymentDueDate).getTime() < today)
    .reduce((s, o) => s + o.due, 0);
  const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const advancesOutstanding = advances
    .filter((a) => a.status === "pending")
    .reduce((s, a) => s + a.amount, 0);
  const travelReimbursement = travelLogs.reduce((s, t) => s + t.reimbursement, 0);
  const repAdvancesGiven = repAdvances.reduce((s, a) => s + a.amount, 0);
  const claimsPending = claims.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);

  const scopeLabel =
    repIds === null
      ? "Whole team"
      : repIds.length === 1
        ? (userName.get(repIds[0]) ?? session.name)
        : `${repIds.length} reps: ${repIds.map((id) => userName.get(id) ?? "—").join(", ")}`;

  return {
    start,
    end,
    scopeLabel,
    sections,
    visits,
    orders,
    payments,
    expenses,
    advances,
    repAdvances,
    claims,
    travelLogs,
    targets,
    tours,
    totals: {
      fulfilledValue,
      collected,
      outstanding,
      overdue,
      expenses: expensesTotal,
      advancesOutstanding,
      travelReimbursement,
      repAdvancesGiven,
      claimsPending,
    },
  };
}
