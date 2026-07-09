import dbConnect from "@/lib/db/connection";
import Blog from "@/models/Blog";
import type {
  NormalizedActivityEvent,
  ProviderSnapshotResult,
  TechProvider,
} from "@/types/techPerformance";

async function fetchSnapshot(): Promise<ProviderSnapshotResult> {
  try {
    await dbConnect();

    const posts = await Blog.find({ status: "published" })
      .select("title slug excerpt category tags publishedAt views likes")
      .sort({ publishedAt: -1 })
      .limit(200)
      .lean();

    const events: NormalizedActivityEvent[] = posts.map((post) => ({
      provider: "blog",
      type: "post_published",
      timestamp: new Date(
        post.publishedAt ?? (post as { createdAt?: Date }).createdAt ?? Date.now()
      ).toISOString(),
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      externalId: String(post._id),
      metadata: { category: post.category, tags: post.tags },
      visibility: "public",
    }));

    return {
      success: true,
      snapshots: [
        {
          type: "blog:activity",
          data: {
            totalPublished: posts.length,
            latest: posts.slice(0, 5).map((p) => ({
              title: p.title,
              slug: p.slug,
              publishedAt: p.publishedAt,
            })),
          },
        },
      ],
      events,
    };
  } catch (error) {
    return {
      success: false,
      snapshots: [],
      error: error instanceof Error ? error.message : "Failed to load blog activity",
    };
  }
}

export const blogProvider: TechProvider = {
  id: "blog",
  isConfigured: () => true,
  fetchSnapshot,
};
