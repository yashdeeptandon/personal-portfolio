import dbConnect from "@/lib/db/connection";
import ActivityEvent from "@/models/ActivityEvent";

export async function getTimelineSection(limit: number, before?: string | null) {
  await dbConnect();

  const query: Record<string, unknown> = { visibility: "public" };
  if (before) query.timestamp = { $lt: new Date(before) };

  const events = await ActivityEvent.find(query)
    .sort({ timestamp: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = events.length > limit;
  const page = events.slice(0, limit);

  return {
    events: page.map((e) => ({
      provider: e.provider,
      type: e.type,
      timestamp: new Date(e.timestamp).toISOString(),
      title: e.title,
      description: e.description ?? null,
      url: e.url ?? null,
      metadata: e.metadata ?? {},
    })),
    nextCursor:
      hasMore && page.length > 0
        ? new Date(page[page.length - 1].timestamp).toISOString()
        : null,
  };
}
