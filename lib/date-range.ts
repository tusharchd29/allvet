export type DateRange = { from: string | null; to: string | null };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses `?from=YYYY-MM-DD&to=YYYY-MM-DD` search params into a DateRange.
 * Malformed or missing values fall back to null (no filter), never throw —
 * an invalid date in the URL should just show unfiltered data, not error. */
export function parseDateRange(searchParams: {
  from?: string;
  to?: string;
}): DateRange {
  const from = searchParams.from && ISO_DATE.test(searchParams.from) ? searchParams.from : null;
  const to = searchParams.to && ISO_DATE.test(searchParams.to) ? searchParams.to : null;
  return { from, to };
}

export function dayStart(date: string): string {
  return `${date}T00:00:00.000Z`;
}
export function dayEnd(date: string): string {
  return `${date}T23:59:59.999Z`;
}
