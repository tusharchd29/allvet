import Link from "next/link";
import { GROWTH_NAV, EVERYDAY_NAV } from "@/components/nav-config";
import PageHeader from "@/components/PageHeader";

const REST = [...EVERYDAY_NAV.slice(4), ...GROWTH_NAV];

export default function MorePage() {
  return (
    <div>
      <PageHeader title="More" />
      <div className="grid grid-cols-2 gap-3">
        {REST.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl bg-white border border-border/60 p-4 flex flex-col items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-offwhite flex items-center justify-center">
              <item.icon size={17} className="text-teal" />
            </div>
            <p className="text-sm font-medium text-ink">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
