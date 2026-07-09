/**
 * Tech Performance provider abstraction.
 *
 * Every provider (github, wakatime, leetcode, plus the local blog/projects
 * providers) implements `TechProvider`. Adding a new provider later means:
 * a new `providers/<id>/` folder implementing this interface, one line in
 * `registry.ts`, and one env var — nothing else in this file changes.
 */

export type {
  TechProviderId,
  TechProvider,
  ProviderSnapshotResult,
  NormalizedActivityEvent,
} from "@/types/techPerformance";

export class TechProviderError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = "TechProviderError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}
