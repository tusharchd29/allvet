import { supabaseAdmin } from "./supabase-admin";
import { getRepScope } from "./data";
import type { Session } from "./session";
import type { OrderStatus } from "./utils";

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

export type ReportData = {
  start: string;
  end: string;
  scopeLabel: string;
  visits: ReportVisit[];
  orders: ReportOrder[];
  payments: ReportPayment[];
  expenses: ReportExpense[];
  advances: ReportAdvance[];
  totals: {
    fulfilledValue: number;
    collected: number;
    outstanding: number;
    overdue: number;
    expenses: number;
    advancesOutstanding: number;
  };
};

function dayStart(date: string) {
  return `${date}T00:00:00.000Z`;
}
function dayEnd(date: string) {
  return `${date}T23:59:59.999Z`;
}

export async function getReportData(session: Session, start: string, end: string): Promise<ReportData> {
  const repId = getRepScope(session);

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
  if (repId) visitsQuery = visitsQuery.eq("rep_id", repId);

  let ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, created_at, product, quantity, amount, status, payment_due_date, customer_id, rep_id")
    .gte("created_at", dayStart(start))
    .lte("created_at", dayEnd(end))
    .order("created_at", { ascending: true });
  if (repId) ordersQuery = ordersQuery.eq("rep_id", repId);

  let paymentsQuery = supabaseAdmin
    .from("av_payments")
    .select("id, created_at, amount, notes, order_id, customer_id, rep_id")
    .gte("created_at", dayStart(start))
    .lte("created_at", dayEnd(end))
    .order("created_at", { ascending: true });
  if (repId) paymentsQuery = paymentsQuery.eq("rep_id", repId);

  let expensesQuery = supabaseAdmin
    .from("av_expenses")
    .select("id, expense_date, category, amount, note, rep_id")
    .gte("expense_date", start)
    .lte("expense_date", end)
    .order("expense_date", { ascending: true });
  if (repId) expensesQuery = expensesQuery.eq("rep_id", repId);

  let advancesQuery = supabaseAdmin
    .from("av_advances")
    .select("id, created_at, amount, status, settled_at, customer_id, rep_id")
    .gte("created_at", dayStart(start))
    .lte("created_at", dayEnd(end))
    .order("created_at", { ascending: true });
  if (repId) advancesQuery = advancesQuery.eq("rep_id", repId);

  const [visitsRes, ordersRes, paymentsRes, expensesRes, advancesRes] = await Promise.all([
    visitsQuery,
    ordersQuery,
    paymentsQuery,
    expensesQuery,
    advancesQuery,
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

  return {
    start,
    end,
    scopeLabel: session.role === "owner" ? "Whole team" : session.name,
    visits,
    orders,
    payments,
    expenses,
    advances,
    totals: {
      fulfilledValue,
      collected,
      outstanding,
      overdue,
      expenses: expensesTotal,
      advancesOutstanding,
    },
  };
}
