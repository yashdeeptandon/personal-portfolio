import dbConnect from "@/lib/db/connection";
import TechSnapshot from "@/models/TechSnapshot";
import ActivityEvent from "@/models/ActivityEvent";
import { logError, logSuccess } from "@/lib/utils/logger";
import { ttlForType } from "@/lib/tech-performance/constants";
import { PROVIDERS } from "./registry";
import type {
  NormalizedActivityEvent,
  ProviderSnapshotResult,
  TechProviderId,
} from "@/types/techPerformance";

async function upsertActivityEvents(
  events: NormalizedActivityEvent[]
): Promise<void> {
  if (!events.length) return;

  const ops = events.map((event) => ({
    updateOne: {
      filter: {
        provider: event.provider,
        type: event.type,
        externalId: event.externalId,
      },
      update: {
        $set: {
          timestamp: new Date(event.timestamp),
          title: event.title,
          description: event.description,
          url: event.url,
          metadata: event.metadata ?? {},
          visibility: event.visibility,
        },
      },
      upsert: true,
    },
  }));

  await ActivityEvent.bulkWrite(ops, { ordered: false });
}

/**
 * Fetches fresh data for one provider and persists it. Never throws —
 * failures are recorded on the existing TechSnapshot rows (status:'error',
 * lastError) without touching `data`, so last-known-good keeps serving the
 * public read routes regardless of upstream health.
 */
export async function syncProvider(id: TechProviderId): Promise<void> {
  await dbConnect();
  const provider = PROVIDERS[id];
  if (!provider || !provider.isConfigured()) return;

  const now = new Date();
  let result: ProviderSnapshotResult;

  try {
    result = await provider.fetchSnapshot();
  } catch (error) {
    result = {
      success: false,
      snapshots: [],
      error: error instanceof Error ? error.message : "Unknown provider error",
    };
  }

  if (result.success) {
    await Promise.all(
      result.snapshots.map(({ type, data }) => {
        const ttlSeconds = ttlForType(type);
        return TechSnapshot.findOneAndUpdate(
          { type },
          {
            $set: {
              provider: id,
              data,
              status: "ok",
              fetchedAt: now,
              staleAt: new Date(now.getTime() + ttlSeconds * 1000),
              lastAttemptAt: now,
            },
            $unset: { lastError: "", lastErrorAt: "" },
            $setOnInsert: { source: "live" },
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      })
    );

    if (result.events?.length) {
      await upsertActivityEvents(result.events);
    }

    logSuccess(`tech-performance sync: ${id}`, {
      snapshotCount: result.snapshots.length,
      eventCount: result.events?.length ?? 0,
    });
  } else {
    await TechSnapshot.updateMany(
      { provider: id },
      {
        $set: {
          status: "error",
          lastError: result.error ?? "Unknown error",
          lastErrorAt: now,
          lastAttemptAt: now,
        },
      }
    );

    logError(new Error(result.error ?? "Unknown provider error"), {
      provider: id,
      context: "tech-performance sync",
    });
  }
}

/**
 * Called by the scheduled ticker (see instrumentation.ts) to bound
 * worst-case staleness even with zero traffic. Reuses the exact same
 * syncProvider path the on-demand trigger uses — no second code path.
 */
export async function syncAllIfStale(): Promise<void> {
  await dbConnect();
  const now = new Date();

  const { withProviderLock } = await import("./refreshLock");
  const { MIN_REFRESH_INTERVAL_MS } = await import(
    "@/lib/tech-performance/constants"
  );

  await Promise.all(
    Object.values(PROVIDERS).map(async (provider) => {
      if (!provider || !provider.isConfigured()) return;

      const docs = await TechSnapshot.find({ provider: provider.id })
        .select("staleAt lastAttemptAt")
        .lean();

      const needsSync =
        docs.length === 0 ||
        docs.some((d) => !d.staleAt || d.staleAt.getTime() < now.getTime());
      if (!needsSync) return;

      const attemptedRecently = docs.some(
        (d) =>
          d.lastAttemptAt &&
          now.getTime() - new Date(d.lastAttemptAt).getTime() <
            MIN_REFRESH_INTERVAL_MS
      );
      if (attemptedRecently) return;

      withProviderLock(provider.id, () => syncProvider(provider.id));
    })
  );
}
