import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";
import { REPORT_SECTIONS, REPORT_SECTION_LABEL } from "@/lib/reports";

export const dynamic = "force-dynamic";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isOwner = session.role === "owner";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: reps } = isOwner
    ? await supabaseAdmin.from("av_users").select("id, name").eq("role", "rep").order("name")
    : { data: [] as { id: string; name: string }[] };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={isOwner ? "Whole-team activity, straight from the data" : "Your activity, straight from the data"}
      />
      <Card>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[var(--teal)]/10 flex items-center justify-center text-[var(--teal)] shrink-0">
            <Icon name="bar-chart-3" size={18} />
          </div>
          <div>
            <div className="font-medium text-[var(--ink)]">Field ops report (PDF)</div>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Pick a date range{isOwner ? ", who it should cover, and which sections to include" : ""} and
              download a PDF. Every figure comes directly from your data — nothing here is
              AI-written. Customer names link straight to their pinned location on Google Maps
              wherever a location has been captured.
            </p>
          </div>
        </div>

        {/* GET so the browser can open the PDF directly; no server action
            needed since this doesn't write anything. */}
        <form action="/api/reports/pdf" method="GET" target="_blank" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 items-end">
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
          </div>

          {isOwner && reps && reps.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                Who (leave all unchecked for the whole team)
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {reps.map((r) => (
                  <label key={r.id} className="inline-flex items-center gap-1.5 text-sm text-[var(--ink)]">
                    <input type="checkbox" name="rep" value={r.id} className="rounded" />
                    {r.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Which reports to include
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {REPORT_SECTIONS.map((s) => (
                <label key={s} className="inline-flex items-center gap-1.5 text-sm text-[var(--ink)]">
                  <input type="checkbox" name="section" value={s} defaultChecked className="rounded" />
                  {REPORT_SECTION_LABEL[s]}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-2.5 inline-flex items-center justify-center gap-2"
          >
            <Icon name="bar-chart-3" size={16} />
            Download PDF report
          </button>
        </form>
      </Card>
    </div>
  );
}
