/**
 * Next.js instrumentation hook — runs once when the server process boots.
 *
 * Starts the Tech Performance background refresh ticker. This app deploys as
 * a single long-running Node process (self-hosted Docker, not serverless),
 * so a plain `setInterval` safely persists for the life of the process. This
 * bounds worst-case data staleness even with zero page traffic — a
 * recruiter's visit is often one-shot, with no natural "check back later"
 * to catch an on-demand refresh their own visit triggered.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startScheduledRefresh } = await import(
    "@/services/tech-performance/scheduler"
  );
  startScheduledRefresh();
}
