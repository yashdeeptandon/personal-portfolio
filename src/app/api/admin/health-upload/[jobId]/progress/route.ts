import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getJob, subscribeJob } from "@/lib/health/jobStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encode = (data: object) =>
        `data: ${JSON.stringify(data)}\n\n`;

      const send = (state: typeof job) => {
        try {
          controller.enqueue(encode(state));
          if (state.status === "complete" || state.status === "error" || state.status === "skipped") {
            controller.close();
          }
        } catch {
          // client disconnected
        }
      };

      // Send current state immediately
      send(job);

      if (job.status === "complete" || job.status === "error" || job.status === "skipped") {
        return;
      }

      const unsubscribe = subscribeJob(jobId, send);

      // Cleanup if client disconnects
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
