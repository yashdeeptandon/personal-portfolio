"use client";

import { useState, useEffect, useRef } from "react";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface HealthStatus {
  hasData: boolean;
  generatedAt?: string;
  dataFrom?: string;
  dataTo?: string;
  dbUpdatedAt?: string;
}

interface JobState {
  jobId: string;
  status: "pending" | "processing" | "complete" | "error" | "skipped";
  progress: number;
  step: string;
  error?: string;
}

const PIPELINE_STEPS = [
  { label: "Extracting ZIP", from: 0, to: 12 },
  { label: "Parsing Apple Health XML", from: 12, to: 47 },
  { label: "Parsing GPS Routes", from: 47, to: 63 },
  { label: "Parsing ECG recordings", from: 63, to: 75 },
  { label: "Exporting metrics", from: 75, to: 82 },
  { label: "Saving to database", from: 82, to: 97 },
  { label: "Done", from: 97, to: 100 },
];

function getActiveStep(progress: number) {
  for (let i = PIPELINE_STEPS.length - 1; i >= 0; i--) {
    if (progress >= PIPELINE_STEPS[i].from) return i;
  }
  return 0;
}

export default function HealthDataPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [job, setJob] = useState<JobState | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evtSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/admin/health/status");
      if (res.ok) {
        const json = await res.json();
        setStatus(json.data);
      }
    } finally {
      setLoadingStatus(false);
    }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".zip")) {
      alert("Please upload a .zip file (Apple Health export).");
      return;
    }
    uploadFile(file);
  }

  async function uploadFile(file: File) {
    // Close any existing SSE
    evtSourceRef.current?.close();
    setJob({
      jobId: "",
      status: "pending",
      progress: 0,
      step: "Uploading...",
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/health-upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setJob((j) => j && { ...j, status: "error", error: err.message || "Upload failed" });
        return;
      }
      const { jobId } = await res.json();
      setJob((j) => j && { ...j, jobId, step: "Queued..." });
      openSSE(jobId);
    } catch (err) {
      setJob((j) => j && { ...j, status: "error", error: String(err) });
    }
  }

  function openSSE(jobId: string) {
    const es = new EventSource(`/api/admin/health-upload/${jobId}/progress`);
    evtSourceRef.current = es;

    es.onmessage = (e) => {
      const state: JobState = JSON.parse(e.data);
      setJob(state);
      if (state.status === "complete" || state.status === "skipped") {
        es.close();
        fetchStatus();
      }
      if (state.status === "error") {
        es.close();
      }
    };

    es.onerror = () => {
      es.close();
      setJob((j) =>
        j && j.status !== "complete" && j.status !== "skipped"
          ? { ...j, status: "error", error: "Connection to server lost." }
          : j
      );
    };
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isRunning = job && (job.status === "pending" || job.status === "processing");
  const activeStep = job ? getActiveStep(job.progress) : -1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Health Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your Apple Health export ZIP to refresh the performance dashboard.
        </p>
      </div>

      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Current Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : status?.hasData ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatusField label="Data from" value={status.dataFrom ?? "—"} />
              <StatusField label="Data to" value={status.dataTo ?? "—"} />
              <StatusField
                label="Generated at"
                value={status.generatedAt ? new Date(status.generatedAt).toLocaleString() : "—"}
              />
              <StatusField
                label="DB updated"
                value={status.dbUpdatedAt ? new Date(status.dbUpdatedAt).toLocaleString() : "—"}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No health data loaded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Upload area */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Upload New Export
          </CardTitle>
        </CardHeader>
        <CardContent className="py-5">
          <div
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : isRunning
                ? "cursor-not-allowed border-border bg-muted"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            )}
            onDragOver={isRunning ? undefined : onDragOver}
            onDragLeave={onDragLeave}
            onDrop={isRunning ? undefined : onDrop}
            onClick={() => !isRunning && fileInputRef.current?.click()}
          >
            <CloudArrowUpIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              {isRunning ? "Processing in progress..." : "Drop Apple Health export.zip here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isRunning ? "Please wait" : "or click to select file"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Export from iPhone: Health app → Profile → Export All Health Data → Share .zip
          </p>
        </CardContent>
      </Card>

      {/* Progress panel */}
      {job && (
        <Card className="overflow-hidden py-0">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Pipeline Progress
            </CardTitle>
            <JobStatusBadge status={job.status} />
          </CardHeader>
          <CardContent className="space-y-4 py-5">
            {/* Current step label */}
            <p className="text-sm font-medium text-foreground">{job.step}</p>

            {/* Progress bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-3 rounded-full transition-all duration-500",
                  job.status === "error"
                    ? "bg-destructive"
                    : job.status === "complete" || job.status === "skipped"
                    ? "bg-green-500"
                    : "bg-primary"
                )}
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <p className="text-right text-xs text-muted-foreground">{job.progress}%</p>

            {/* Step list */}
            <ol className="mt-4 space-y-2">
              {PIPELINE_STEPS.map((step, i) => {
                const isDone = job.progress >= step.to;
                const isActive = i === activeStep && isRunning;
                return (
                  <li key={step.label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isDone
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isDone
                          ? "text-green-600 dark:text-green-400"
                          : isActive
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                      {isActive && (
                        <ArrowPathIcon className="ml-1 inline h-3 w-3 animate-spin" />
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* Error message */}
            {job.status === "error" && job.error && (
              <div className="mt-3 rounded border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <span className="font-medium">Error: </span>
                {job.error}
              </div>
            )}

            {/* Skipped message */}
            {job.status === "skipped" && (
              <div className="mt-3 rounded border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                No new data found — the uploaded export has the same or older data than what is
                already in the database.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function JobStatusBadge({ status }: { status: JobState["status"] }) {
  const map: Record<
    JobState["status"],
    { label: string; variant: BadgeVariant; icon: React.ReactNode }
  > = {
    pending: {
      label: "Queued",
      variant: "neutral",
      icon: <ClockIcon className="h-3.5 w-3.5" />,
    },
    processing: {
      label: "Running",
      variant: "info",
      icon: <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />,
    },
    complete: {
      label: "Complete",
      variant: "success",
      icon: <CheckCircleIcon className="h-3.5 w-3.5" />,
    },
    skipped: {
      label: "Skipped",
      variant: "warning",
      icon: <ClockIcon className="h-3.5 w-3.5" />,
    },
    error: {
      label: "Failed",
      variant: "destructive",
      icon: <ExclamationCircleIcon className="h-3.5 w-3.5" />,
    },
  };
  const { label, variant, icon } = map[status];
  return (
    <Badge variant={variant}>
      {icon}
      {label}
    </Badge>
  );
}
