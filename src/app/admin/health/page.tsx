"use client";

import { useState, useEffect, useRef } from "react";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

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
        <h1 className="text-2xl font-bold text-gray-900">Health Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your Apple Health export ZIP to refresh the performance dashboard.
        </p>
      </div>

      {/* Status card */}
      <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Current Data
        </h2>
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-gray-400">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : status?.hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <p className="text-sm text-gray-400">No health data loaded yet.</p>
        )}
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Upload New Export
          </h2>
        </div>
        <div className="p-5">
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-blue-500 bg-blue-50"
                : isRunning
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
            onDragOver={isRunning ? undefined : onDragOver}
            onDragLeave={onDragLeave}
            onDrop={isRunning ? undefined : onDrop}
            onClick={() => !isRunning && fileInputRef.current?.click()}
          >
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              {isRunning ? "Processing in progress..." : "Drop Apple Health export.zip here"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
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
          <p className="text-xs text-gray-400 mt-2">
            Export from iPhone: Health app → Profile → Export All Health Data → Share .zip
          </p>
        </div>
      </div>

      {/* Progress panel */}
      {job && (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Pipeline Progress
            </h2>
            <JobStatusBadge status={job.status} />
          </div>
          <div className="p-5 space-y-4">
            {/* Current step label */}
            <p className="text-sm text-gray-700 font-medium">{job.step}</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  job.status === "error"
                    ? "bg-red-500"
                    : job.status === "complete" || job.status === "skipped"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">{job.progress}%</p>

            {/* Step list */}
            <ol className="space-y-2 mt-4">
              {PIPELINE_STEPS.map((step, i) => {
                const isDone = job.progress >= step.to;
                const isActive = i === activeStep && isRunning;
                return (
                  <li key={step.label} className="flex items-center gap-3">
                    <span
                      className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? "bg-green-100 text-green-700"
                          : isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        isDone
                          ? "text-green-700"
                          : isActive
                          ? "text-blue-700 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                      {isActive && (
                        <ArrowPathIcon className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* Error message */}
            {job.status === "error" && job.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <span className="font-medium">Error: </span>
                {job.error}
              </div>
            )}

            {/* Skipped message */}
            {job.status === "skipped" && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                No new data found — the uploaded export has the same or older data than what is
                already in the database.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

function JobStatusBadge({ status }: { status: JobState["status"] }) {
  const map: Record<
    JobState["status"],
    { label: string; className: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "Queued",
      className: "bg-gray-100 text-gray-600",
      icon: <ClockIcon className="h-3.5 w-3.5" />,
    },
    processing: {
      label: "Running",
      className: "bg-blue-100 text-blue-700",
      icon: <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />,
    },
    complete: {
      label: "Complete",
      className: "bg-green-100 text-green-700",
      icon: <CheckCircleIcon className="h-3.5 w-3.5" />,
    },
    skipped: {
      label: "Skipped",
      className: "bg-yellow-100 text-yellow-700",
      icon: <ClockIcon className="h-3.5 w-3.5" />,
    },
    error: {
      label: "Failed",
      className: "bg-red-100 text-red-700",
      icon: <ExclamationCircleIcon className="h-3.5 w-3.5" />,
    },
  };
  const { label, className, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
}
