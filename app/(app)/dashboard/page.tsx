import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getDashboardStats,
  getRecentActivity,
  getPaymentDues,
  getMapCustomers,
  getZoneBreakdown,
} from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusPill } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/icon";
import { formatCurrency, formatDate, ZONE_LABEL, type Zone } from "@/lib/utils";
import { parseDateRange } from "@/lib/date-range";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { redirect } from "next/navigation";
import { MapView } from "../map/MapView";
import { DailyQuote } from "@/components/DailyQuote";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const range = parseDateRange(await searchParams);

  const [stats, activity, dues, mapCustomers, zoneBreakdown] = await Promise.all([
    getDashboardStats(session, range),
    getRecentActivity(session, 6),
    getPaymentDues(session),
    getMapCustomers(session),
    getZoneBreakdown(session),
  ]);

  return (
    <div>
      <PageHeader
        title={`Hi ${session.name}`}
        subtitle={
          session.role === "owner"
            ? "Here's how the whole team is doing"
            : "Here's your day at a glance"
        }
      />

      <DailyQuote />

      <DateRangeFilter />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Customers" value={String(stats.customersCount)} icon="users" tone="teal" />
        <StatCard label="Visits logged" value={String(stats.visitsCount)} icon="map-pin" tone="teal" />
        <StatCard label="Orders fulfilled" value={String(stats.fulfilledCount)} icon="check" tone="mint" />
        <StatCard label="In pipeline" value={String(stats.pipelineCount)} icon="clock" tone="seafoam" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/payments">
          <Card className="hover:border-[var(--teal)] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                  <Icon name="indian-rupee" size={13} /> Payment due
                </div>
                <div className="text-lg font-semibold text-[var(--ink)] mt-1">
                  {formatCurrency(dues.totalDue)}
                </div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  {dues.outstandingCount} order{dues.outstandingCount === 1 ? "" : "s"} outstanding
                </div>
              </div>
              <Icon name="chevron-right" size={18} className="text-[var(--muted)]" />
            </div>
          </Card>
        </Link>
        <Link href="/payments?filter=overdue">
          <Card className={`hover:border-[var(--teal)] transition-colors ${dues.overdueCount > 0 ? "border-red-300" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                  <Icon name="clock" size={13} /> Overdue
                </div>
                <div className={`text-lg font-semibold mt-1 ${dues.overdueCount > 0 ? "text-red-600" : "text-[var(--ink)]"}`}>
                  {formatCurrency(dues.overdueTotal)}
                </div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  {dues.overdueCount} order{dues.overdueCount === 1 ? "" : "s"} past due
                </div>
              </div>
              <Icon name="chevron-right" size={18} className="text-[var(--muted)]" />
            </div>
          </Card>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-[var(--ink)]">
            {session.role === "owner" ? "Team target" : "Your target"}
          </div>
          <div className="text-sm text-[var(--muted)]">
            {formatCurrency(stats.fulfilledTotal)} / {formatCurrency(stats.targetTotal)}
          </div>
        </div>
        <ProgressBar pct={stats.achievementPct} />
      </Card>

      {session.role === "owner" && stats.repBreakdown.length > 0 && (
        <Card className="mb-6">
          <div className="font-medium text-[var(--ink)] mb-3">By rep</div>
          <div className="space-y-3">
            {stats.repBreakdown.map((r) => {
              const pct =
                r.target > 0 ? Math.min(100, Math.round((r.fulfilled / r.target) * 100)) : 0;
              return (
                <div key={r.repId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--ink)]">{r.name}</span>
                    <span className="text-[var(--muted)]">
                      {formatCurrency(r.fulfilled)} / {formatCurrency(r.target)}
                    </span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium text-[var(--ink)] flex items-center gap-1.5">
            <Icon name="map" size={16} className="text-[var(--teal)]" /> Territory coverage
          </div>
          <Link href="/map" className="text-xs text-[var(--teal)] underline">
            Open full map
          </Link>
        </div>

        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {(["north", "central", "west", "south"] as Zone[]).map((z) => (
            <Link
              key={z}
              href={`/map?zone=${z}`}
              className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] whitespace-nowrap"
            >
              {ZONE_LABEL[z]}: {zoneBreakdown[z] ?? 0}
            </Link>
          ))}
          {zoneBreakdown.unassigned > 0 && (
            <span className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] whitespace-nowrap">
              No zone: {zoneBreakdown.unassigned}
            </span>
          )}
        </div>

        {mapCustomers.length === 0 && (
          <p className="text-xs text-[var(--muted)] mb-2">
            No locations pinned yet — showing India. Capture one while adding a customer or logging a visit.
          </p>
        )}
        <Link href="/map">
          <MapView
            customers={mapCustomers.map((c) => ({
              id: c.id,
              name: c.name,
              latitude: c.latitude as number,
              longitude: c.longitude as number,
              zone: c.zone,
              segment: c.segment,
            }))}
            height="260px"
            interactive={false}
          />
        </Link>
      </Card>

      <Card>
        <div className="font-medium text-[var(--ink)] mb-3">Recent activity</div>
        {activity.orders.length === 0 && activity.visits.length === 0 ? (
          <EmptyState
            icon="package"
            title="Nothing yet"
            subtitle="Visits and orders will show up here as they come in."
          />
        ) : (
          <div className="space-y-3">
            {activity.orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-[var(--ink)]">
                    {/* @ts-expect-error joined relation */}
                    {o.av_customers?.name ?? "Order"}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {formatDate(o.created_at)} · {formatCurrency(o.amount)}
                  </div>
                </div>
                <StatusPill status={o.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
