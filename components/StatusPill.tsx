import { STATUS_LABEL, type OrderStatus } from "@/lib/utils";

export function StatusPill({ status }: { status: string }) {
  const s = status as OrderStatus;
  return (
    <span
      className={`status-${s} inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold`}
    >
      {STATUS_LABEL[s] ?? status}
    </span>
  );
}
