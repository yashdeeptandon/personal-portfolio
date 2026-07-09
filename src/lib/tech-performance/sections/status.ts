import dbConnect from "@/lib/db/connection";
import TechSnapshot from "@/models/TechSnapshot";
import { getProviderIds, getProvider } from "@/services/tech-performance/registry";
import type { TechPerformanceStatus } from "@/types/techPerformance";

export async function getStatusSection(): Promise<TechPerformanceStatus> {
  await dbConnect();

  const ids = getProviderIds();
  const docs = await TechSnapshot.find({ provider: { $in: ids } })
    .select("provider status fetchedAt lastError")
    .lean();

  const providers = ids.map((id) => {
    const provider = getProvider(id);
    const configured = provider?.isConfigured() ?? false;
    const providerDocs = docs.filter((d) => d.provider === id);

    if (!configured || providerDocs.length === 0) {
      return {
        id,
        configured,
        status: "unconfigured" as const,
        fetchedAt: null,
      };
    }

    const erroredDoc = providerDocs.find((d) => d.status === "error");
    const oldestFetch = providerDocs.reduce<Date | null>((min, d) => {
      if (!d.fetchedAt) return min;
      const t = new Date(d.fetchedAt);
      return !min || t < min ? t : min;
    }, null);

    return {
      id,
      configured: true,
      status: erroredDoc ? ("error" as const) : ("ok" as const),
      fetchedAt: oldestFetch ? oldestFetch.toISOString() : null,
      ...(erroredDoc?.lastError ? { lastError: erroredDoc.lastError } : {}),
    };
  });

  return { providers };
}
