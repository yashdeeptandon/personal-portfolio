import dbConnect from "@/lib/db/connection";
import Project from "@/models/Project";
import type {
  NormalizedActivityEvent,
  ProviderSnapshotResult,
  TechProvider,
} from "@/types/techPerformance";

async function fetchSnapshot(): Promise<ProviderSnapshotResult> {
  try {
    await dbConnect();

    const projects = await Project.find({})
      .select(
        "title slug shortDescription technologies status githubUrl liveUrl startDate endDate featured"
      )
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const events: NormalizedActivityEvent[] = [];
    for (const project of projects) {
      events.push({
        provider: "projects",
        type: "milestone",
        timestamp: new Date(project.startDate).toISOString(),
        title: `Started ${project.title}`,
        description: project.shortDescription,
        url: `/projects/${project.slug}`,
        externalId: `${project._id}-start`,
        metadata: { technologies: project.technologies, status: project.status },
        visibility: "public",
      });

      if (project.status === "completed" && project.endDate) {
        events.push({
          provider: "projects",
          type: "milestone",
          timestamp: new Date(project.endDate).toISOString(),
          title: `Shipped ${project.title}`,
          description: project.shortDescription,
          url: project.liveUrl || `/projects/${project.slug}`,
          externalId: `${project._id}-shipped`,
          metadata: { technologies: project.technologies, status: project.status },
          visibility: "public",
        });
      }
    }

    return {
      success: true,
      snapshots: [
        {
          type: "projects:activity",
          data: {
            total: projects.length,
            completed: projects.filter((p) => p.status === "completed").length,
            inProgress: projects.filter((p) => p.status === "in-progress").length,
            featured: projects.filter((p) => p.featured).length,
          },
        },
      ],
      events,
    };
  } catch (error) {
    return {
      success: false,
      snapshots: [],
      error:
        error instanceof Error ? error.message : "Failed to load project activity",
    };
  }
}

export const projectsProvider: TechProvider = {
  id: "projects",
  isConfigured: () => true,
  fetchSnapshot,
};
