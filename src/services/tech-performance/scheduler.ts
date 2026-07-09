import { SCHEDULED_REFRESH_INTERVAL_MS } from "@/lib/tech-performance/constants";
import { logError, logStartup } from "@/lib/utils/logger";
import { syncAllIfStale } from "./sync";

let started = false;

/**
 * Idempotent — safe to call more than once (Next.js can invoke
 * `register()` more than once in some dev-mode scenarios); only the first
 * call actually starts the interval.
 */
export function startScheduledRefresh(): void {
  if (started) return;
  started = true;

  logStartup("Tech Performance scheduled refresh ticker started", {
    intervalMs: SCHEDULED_REFRESH_INTERVAL_MS,
  });

  setInterval(() => {
    syncAllIfStale().catch((error) =>
      logError(error, { context: "tech-performance scheduled refresh" })
    );
  }, SCHEDULED_REFRESH_INTERVAL_MS);
}
