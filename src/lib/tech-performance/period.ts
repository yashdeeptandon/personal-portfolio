export type TechPeriod = "today" | "7d" | "30d" | "year" | "all";

const VALID_PERIODS: TechPeriod[] = ["today", "7d", "30d", "year", "all"];

export function isValidPeriod(value: string): value is TechPeriod {
  return (VALID_PERIODS as string[]).includes(value);
}

/** Live-data dashboard — anchors to `now`, unlike the health dashboard's
 *  anchor to its latest upload date. Returns null for "all" (no lower bound). */
export function getPeriodStart(
  period: TechPeriod,
  now: Date = new Date()
): Date | null {
  const start = new Date(now);
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return start;
    case "7d":
      start.setDate(start.getDate() - 7);
      return start;
    case "30d":
      start.setDate(start.getDate() - 30);
      return start;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      return start;
    case "all":
      return null;
  }
}
