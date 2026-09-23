import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { createBrochure } from "./actions";

export const dynamic = "force-dynamic";

export default async function BrochuresPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: brochures } = await supabaseAdmin
    .from("av_brochures")
    .select("id, title, url")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="Brochures" subtitle="Share product material over WhatsApp" />

      {session.role === "owner" && (
        <Card className="mb-6">
          <div className="font-medium text-[var(--ink)] mb-3">Add a brochure</div>
          <form action={createBrochure} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Title</label>
              <input name="title" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Link</label>
              <input name="url" required className="input-field" placeholder="https://..." />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">
              Save
            </button>
          </form>
        </Card>
      )}

      {!brochures || brochures.length === 0 ? (
        <Card>
          <EmptyState icon="book-open" title="No brochures yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {brochures.map((b) => (
            <Card key={b.id} className="flex items-center justify-between">
              <div className="font-medium text-[var(--ink)]">{b.title}</div>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${b.title}: ${b.url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Share on WhatsApp
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
