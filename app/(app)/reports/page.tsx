import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={session.role === "owner" ? "Whole-team activity, straight from the data" : "Your activity, straight from the data"}
      />
      <Card>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[var(--teal)]/10 flex items-center justify-center text-[var(--teal)] shrink-0">
            <Icon name="bar-chart-3" size={18} />
          </div>
          <div>
            <div className="font-medium text-[var(--ink)]">Field ops report (PDF)</div>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Pick a date range and download a PDF covering visits, orders, payments, expenses,
              and advances for that period. Every figure comes directly from your data — nothing
              here is AI-written. Customer names link straight to their pinned location on Google
              Maps wherever a location has been captured.
            </p>
          </div>
        </div>

        {/* GET so the browser can open the PDF directly; no server action
            needed since this doesn't write anything. */}
        <form
          action="/api/reports/pdf"
          method="GET"
          target="_blank"
          className="grid grid-cols-2 gap-3 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">From</label>
            <input
              type="date"
              name="start"
              required
              max={isoDate(now)}
              defaultValue={isoDate(monthStart)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">To</label>
            <input
              type="date"
              name="end"
              required
              max={isoDate(now)}
              defaultValue={isoDate(now)}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            className="btn-primary col-span-2 py-2.5 inline-flex items-center justify-center gap-2"
          >
            <Icon name="bar-chart-3" size={16} />
            Download PDF report
          </button>
        </form>
      </Card>
    </div>
  );
}
