import Link from "next/link";
import { EVERYDAY_NAV, GROWTH_NAV } from "./nav-config";
import { Icon } from "./icon";
import type { Session } from "@/lib/session";

export function Sidebar({ session }: { session: Session }) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-[var(--border)] bg-white h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--teal)] flex items-center justify-center text-white font-bold text-sm">
          AV
        </div>
        <div>
          <div className="font-semibold text-[var(--ink)] leading-tight">
            Allvet
          </div>
          <div className="text-xs text-[var(--muted)] leading-tight">
            Field Ops
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide px-2 mb-2">
          Everyday
        </div>
        <ul className="space-y-0.5 mb-5">
          {EVERYDAY_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-[var(--ink)] hover:bg-[var(--offwhite)] transition-colors"
              >
                <Icon name={item.icon} size={17} className="text-[var(--teal)]" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide px-2 mb-2">
          Growth & Oversight
        </div>
        <ul className="space-y-0.5">
          {GROWTH_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-[var(--ink)] hover:bg-[var(--offwhite)] transition-colors"
              >
                <Icon name={item.icon} size={17} className="text-[var(--seafoam)]" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[var(--border)] px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--offwhite)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold text-[var(--ink)]">
            {session.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-[var(--ink)] truncate">
              {session.name}
            </div>
            <div className="text-xs text-[var(--muted)] capitalize">
              {session.role}
            </div>
          </div>
        </div>
        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] py-2 rounded-lg border border-[var(--border)]"
          >
            <Icon name="log-out" size={15} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
