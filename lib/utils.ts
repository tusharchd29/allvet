export function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number | null | undefined): string {
  const n = value ?? 0;
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "dispatched",
  "fulfilled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  fulfilled: "Fulfilled",
};

export const ZONES = ["north", "central", "west", "south"] as const;

export type Zone = (typeof ZONES)[number];

export const ZONE_LABEL: Record<Zone, string> = {
  north: "North",
  central: "Central",
  west: "West",
  south: "South",
};

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}
