import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { createBrochure } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

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
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Upload file (PDF, JPEG, PNG, or WEBP)
              </label>
              <input
                type="file"
                name="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="input-field file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--teal)]/10 file:text-[var(--teal)] file:text-sm file:font-medium file:cursor-pointer"
              />
              <p className="text-xs text-[var(--muted)] mt-1">Up to 20 MB.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Or paste a link instead
              </label>
              <input name="url" className="input-field" placeholder="https://..." />
            </div>
            <SubmitButton>Save</SubmitButton>
          </form>
        </Card>
      )}

      {!brochures || brochures.length === 0 ? (
        <Card>
          <EmptyState icon="book-open" title="No brochures yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {brochures.map((b) =>
            session.role === "owner" ? (
              <EditableCard
                key={b.id}
                table="av_brochures"
                id={b.id}
                revalidate={["/brochures"]}
                initialValues={{ title: b.title, url: b.url }}
                fields={[
                  { name: "title", label: "Title", type: "text" },
                  { name: "url", label: "Link", type: "text" },
                ]}
                className="flex items-center justify-between"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--ink)]">{b.title}</div>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${b.title}: ${b.url}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
                  >
                    Share on WhatsApp
                  </a>
                </div>
              </EditableCard>
            ) : (
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
            ),
          )}
        </div>
      )}
    </div>
  );
}
