import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { formatCurrency } from "@/lib/utils";
import { createProduct } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { ActionForm } from "@/components/ActionForm";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: products } = await supabaseAdmin
    .from("av_products")
    .select("id, name, category, default_unit, default_price, active")
    .order("category", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Shared catalog everyone orders from — add categories and presets here"
      />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Add a product</div>
        <ActionForm action={createProduct} resetOnSuccess className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Name</label>
            <input name="name" required className="input-field" placeholder="e.g. Calcium Bolus" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Category
              </label>
              <input
                name="category"
                className="input-field"
                placeholder="e.g. Supplements"
                list="product-categories"
              />
              <datalist id="product-categories">
                {Array.from(new Set((products ?? []).map((p) => p.category).filter(Boolean))).map(
                  (c) => (
                    <option key={c as string} value={c as string} />
                  ),
                )}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Default unit
              </label>
              <input name="default_unit" className="input-field" placeholder="e.g. box" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Default price (₹)
            </label>
            <input name="default_price" type="number" step="0.01" className="input-field" placeholder="Optional" />
          </div>
          <SubmitButton>Add product</SubmitButton>
        </ActionForm>
      </Card>

      {!products || products.length === 0 ? (
        <Card>
          <EmptyState icon="tags" title="No products yet" subtitle="Add your first product to start using presets on orders." />
        </Card>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <EditableCard
              key={p.id}
              table="av_products"
              id={p.id}
              revalidate={["/products", "/orders/new"]}
              initialValues={{
                name: p.name,
                category: p.category,
                default_unit: p.default_unit,
                default_price: p.default_price,
                active: p.active,
              }}
              fields={[
                { name: "name", label: "Name", type: "text" },
                { name: "category", label: "Category", type: "text" },
                { name: "default_unit", label: "Default unit", type: "text" },
                { name: "default_price", label: "Default price (₹)", type: "number" },
                { name: "active", label: "Active (shows in the order picker)", type: "checkbox" },
              ]}
              className="flex items-center justify-between"
            >
              <div>
                <div className={`font-medium ${p.active ? "text-[var(--ink)]" : "text-[var(--muted)] line-through"}`}>
                  {p.name}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {[p.category, p.default_unit, p.default_price ? formatCurrency(p.default_price) : null]
                    .filter(Boolean)
                    .join(" · ") || "No details yet"}
                </div>
              </div>
            </EditableCard>
          ))}
        </div>
      )}
    </div>
  );
}
