import { NextRequest } from "next/server";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  validationErrorResponse,
  rateLimitResponse,
} from "@/lib/utils/response";
import { techPerformanceRefreshSchema } from "@/lib/validation/schemas";
import { adminRefreshLimiter } from "@/lib/tech-performance/rateLimiter";
import {
  getProviderIds,
  syncProvider,
  withProviderLock,
} from "@/services/tech-performance";
import type { TechProviderId } from "@/types/techPerformance";

export const POST = withAdminAuth(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}));
  const { error, value } = techPerformanceRefreshSchema.validate(body);
  if (error) {
    return validationErrorResponse(error.message);
  }

  const rateLimitKey = value.provider ?? "all";
  try {
    await adminRefreshLimiter.consume(rateLimitKey);
  } catch {
    return rateLimitResponse(
      "Refresh triggered too recently — please wait a minute and try again."
    );
  }

  const targets: TechProviderId[] = value.provider
    ? [value.provider as TechProviderId]
    : getProviderIds();

  for (const id of targets) {
    withProviderLock(id, () => syncProvider(id));
  }

  return successResponse(
    "Refresh triggered",
    { providers: targets },
    202
  );
});
