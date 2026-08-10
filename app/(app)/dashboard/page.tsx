import { getSession } from "@/lib/session";
import { getDashboardStats, getRecentActivity } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MapPin, ShoppingCart, Target, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = (await getSession())!;
  const stats = await getDashboardStats(session);
  const activity = await getRecentActivity(session);

  return (
    <div>
      <PageHeader
        title={`Hi ${session.name.split(" ")[0]}`}
        subtitle={session.role === "owner" ? "Here's how the whole team is doing this month." : "Here's your month so far."}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Visits this month" value={stats.visitsCount} icon={MapPin} />
        <StatCard label="Orders fulfilled" value={stats.fulfilledCount} sub={formatCurrency(stats.fulfilledTotal)} icon={ShoppingCart} />
        <StatCard label="In pipeline" value={stats.pipelineCount} sub="Confirmed / dispatched" icon={Clock} />
        <StatCard
          label="Target achieved"
          value={stats.achievement !== null ? `${stats.achievement}%` : "—"}
          icon={Target}
          tone="mint"
        />
      </div>

      {session.role === "owner" && stats.repBreakdown.length > 0 && (
        <Card className="mb-8" padded={false}>
          <div className="p-5 border-b border-border/60">
            <p className="font-medium text-ink">Team breakdown</p>
          </div>
          <div className="divide-y divide-border/60">
            {stats.repBreakdown.map((r) => {
              const pct = r.target > 0 ? Math.round((r.fulfilled / r.target) * 100) : 0;
              return (
                <div key={r.repId} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-ink">{r.name}</p>
                    <p className="text-sm text-muted">
                      {formatCurrency(r.fulfilled)} {r.target > 0 && <span>/ {formatCurrency(r.target)}</span>}
                    </p>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <p className="font-medium text-ink">Recent visits</p>
          <Link href="/visits" className="text-sm text-teal font-medium">View all</Link>
        </div>
        {activity.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No visits logged yet" hint="Visits you log will show up here." />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {activity.map((v: any) => (
              <div key={v.id} className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{v.av_customers?.name || "Customer"}</p>
                  <p className="text-xs text-muted mt-0.5">{v.purpose || "Visit"} {session.role === "owner" && v.av_users?.name ? `· ${v.av_users.name}` : ""}</p>
                </div>
                <p className="text-xs text-muted shrink-0">{formatDate(v.visit_date)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
