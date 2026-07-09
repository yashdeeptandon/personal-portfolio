/**
 * Bare `fetch` has no default timeout in Node. Without one, a hung upstream
 * (observed: WakaTime's 365-day `summaries` call can legitimately take
 * 30-45s, and a truly stuck request would just hang forever) would hold the
 * in-memory provider lock (`refreshLock.ts`) open indefinitely — permanently
 * wedging that provider's refresh capability until the next process restart.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 20_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
