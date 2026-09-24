import Link from "next/link";
import { getSession } from "@/lib/session";
import { GROWTH_NAV } from "@/components/nav-config";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default async function MorePage() {
  const session = await getSession();
  const isOwner = session?.role === "owner";

  return (
    <div>
      <PageHeader title="More" />
      <div className="space-y-2">
        {[
          { href: "/map", label: "Territory Map", icon: "map" },
          ...GROWTH_NAV,
          { href: "/tours", label: "Tour Plan", icon: "calendar" },
          { href: "/travel", label: "Travel Log", icon: "car" },
        ]
          .filter((item) => !("ownerOnly" in item) || !item.ownerOnly || isOwner)
          .map(
          (item) => (
            <Link key={item.href} href={item.href}>
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} size={18} className="text-[var(--teal)]" />
                  <span className="text-[var(--ink)] font-medium">{item.label}</span>
                </div>
                <Icon name="chevron-right" size={16} className="text-[var(--muted)]" />
              </Card>
            </Link>
          ),
        )}
        <form action="/api/logout" method="POST">
          <button type="submit" className="btn-secondary w-full py-2.5 mt-2">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
