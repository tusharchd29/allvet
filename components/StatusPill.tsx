import { OrderStatus, STATUS_LABEL } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        `status-${status}`
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
