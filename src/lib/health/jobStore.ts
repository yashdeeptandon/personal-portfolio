import { EventEmitter } from "events";

export type JobStatus = "pending" | "processing" | "complete" | "error" | "skipped";

export interface JobState {
  jobId: string;
  status: JobStatus;
  progress: number;
  step: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

const jobs = new Map<string, JobState>();
const emitters = new Map<string, EventEmitter>();

export function createJob(jobId: string): JobState {
  const state: JobState = {
    jobId,
    status: "pending",
    progress: 0,
    step: "Queued",
    startedAt: new Date(),
  };
  jobs.set(jobId, state);
  emitters.set(jobId, new EventEmitter());
  return state;
}

export function updateJob(jobId: string, patch: Partial<JobState>): void {
  const current = jobs.get(jobId);
  if (!current) return;
  const next = { ...current, ...patch };
  jobs.set(jobId, next);
  emitters.get(jobId)?.emit("update", next);
}

export function getJob(jobId: string): JobState | undefined {
  return jobs.get(jobId);
}

export function subscribeJob(
  jobId: string,
  listener: (state: JobState) => void
): () => void {
  const emitter = emitters.get(jobId);
  if (!emitter) return () => {};
  emitter.on("update", listener);
  return () => emitter.off("update", listener);
}

export function cleanupJob(jobId: string): void {
  jobs.delete(jobId);
  emitters.delete(jobId);
}
