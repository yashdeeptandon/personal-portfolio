/**
 * Sums a date-keyed series (daily WakaTime activity, GitHub contribution
 * calendar, …) from `start` onward. `start: null` sums everything in the
 * series — which is only "all-time" if the series itself isn't capped
 * short of all-time (see callers' comments where that matters, e.g.
 * WakaTime's activity snapshot only covers ~365 days).
 */
export function sumSince<T extends { date: string }>(
  items: T[],
  start: Date | null,
  valueOf: (item: T) => number
): number {
  const startStr = start ? start.toISOString().slice(0, 10) : null;
  return items
    .filter((d) => !startStr || d.date >= startStr)
    .reduce((sum, d) => sum + valueOf(d), 0);
}
