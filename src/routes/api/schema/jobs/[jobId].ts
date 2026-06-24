import type { APIEvent } from "@solidjs/start/server";
import { Job } from "bullmq";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import type { SchemaJobQueueData } from "~/lib/schema/schemaJobs/schemaJobTypes";
import {
  parseSchemaJobIdParam,
  schemaJobQueue,
} from "~/server/queue/schemaJobQueue";
import { validateUserAndPermissions } from "~/routes/api/schema/export/validation/validateUserAndPermissions";

function getJobFailureDetails(job: Job<SchemaJobQueueData>): string | null {
  if (!Array.isArray(job.stacktrace) || job.stacktrace.length === 0) {
    return null;
  }
  return job.stacktrace.join("\n\n");
}

function getImportParseIssueSummary(result: unknown): {
  message: string;
  details: string | null;
} | null {
  if (!result || typeof result !== "object") {
    return null;
  }
  const detailsObj = (result as { details?: unknown }).details;
  if (!detailsObj || typeof detailsObj !== "object") {
    return null;
  }
  const parseErrors = (detailsObj as { parseErrors?: unknown }).parseErrors;
  if (!Array.isArray(parseErrors) || parseErrors.length === 0) {
    return null;
  }
  const first = parseErrors[0] as {
    websiteName?: string;
    schemaType?: string;
    fileName?: string;
    message?: string;
  };
  const firstPath =
    first?.websiteName && first?.schemaType && first?.fileName
      ? `${first.websiteName}/${first.schemaType}/${first.fileName}`
      : "unknown file";
  const firstMessage = first?.message ? `: ${first.message}` : "";
  return {
    message: `${parseErrors.length} schema file(s) failed to parse and were skipped`,
    details: `First parse error at ${firstPath}${firstMessage}`,
  };
}

function mapBullState(
  state: string,
): "queued" | "running" | "success" | "failed" {
  if (state === "waiting" || state === "delayed" || state === "paused") {
    return "queued";
  }
  if (state === "active") {
    return "running";
  }
  if (state === "completed") {
    return "success";
  }
  if (state === "failed") {
    return "failed";
  }
  return "queued";
}

export async function GET({ request, params }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  const rawId = params.jobId as string | undefined;

  try {
    await validateUserAndPermissions(request, dbSession);

    if (!rawId?.trim()) {
      throw new APIError("jobId is required", 400);
    }

    const bullId = parseSchemaJobIdParam(rawId);
    const job = await Job.fromId(schemaJobQueue, bullId);
    if (!job) {
      return new Response(
        JSON.stringify({
          jobId: rawId.trim(),
          status: "complete",
          message:
            "Job not found or no longer in Redis (expired after completion).",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = job.data as SchemaJobQueueData;
    if (data.subDomain !== subDomain) {
      throw new APIError("Forbidden", 403);
    }

    const bullState = await job.getState();
    const status = mapBullState(bullState);

    const result =
      status === "success" && job.returnvalue != null ? job.returnvalue : null;
    const parseIssue =
      status === "success" ? getImportParseIssueSummary(result) : null;

    return new Response(
      JSON.stringify({
        jobId: rawId.trim(),
        operation: data.operation,
        status,
        subDomain: data.subDomain,
        createdAt: job.timestamp ? new Date(job.timestamp).toISOString() : null,
        startedAt: job.processedOn
          ? new Date(job.processedOn).toISOString()
          : null,
        finishedAt: job.finishedOn
          ? new Date(job.finishedOn).toISOString()
          : null,
        error:
          status === "failed"
            ? job.failedReason
            : (parseIssue?.message ?? null),
        errorDetails:
          status === "failed"
            ? getJobFailureDetails(job)
            : (parseIssue?.details ?? null),
        result,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
