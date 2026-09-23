import { getSession } from "@/lib/session";
import { getDashboardStats, getRecentActivity } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusPill } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const stats = await getDashboardStats(session);
  const activity = await getRecentActivity(session, 6);

  return (
    <div>
      <PageHeader
        title={`Hi ${session.name.split(" ")[0]}`}
        subtitle={
          session.role === "owner"
            ? "Here's how the whole team is doing"
            : "Here's your day at a glance"
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Visits logged" value={String(stats.visitsCount)} icon="map-pin" tone="teal" />
        <StatCard label="Orders fulfilled" value={String(stats.fulfilledCount)} icon="check" tone="mint" />
        <StatCard label="In pipeline" value={String(stats.pipelineCount)} icon="clock" tone="seafoam" />
        <StatCard label="Target achieved" value={`${stats.achievementPct}%`} icon="target" tone="teal" />
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
