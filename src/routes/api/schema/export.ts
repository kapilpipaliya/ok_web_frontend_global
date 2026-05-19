import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { buildExportJobPayload } from "~/lib/schema/schemaJobs/schemaJobWorker";
import { enqueueSchemaJob } from "~/server/queue/schemaJobQueue";
import { validateUserAndPermissions } from "~/routes/api/schema/export/validation/validateUserAndPermissions";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await validateUserAndPermissions(request, dbSession);

    const payload = buildExportJobPayload(request);

    const enqueued = await enqueueSchemaJob({
      operation: "export",
      databaseName: subDomain,
      subDomain,
      userEmail: String(user.P.email ?? ""),
      payload,
    });
    if (!enqueued.ok) {
      return new Response(
        JSON.stringify({
          status: "failed",
          operation: "export",
          error: enqueued.error,
          message: enqueued.error,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        jobId: enqueued.jobId,
        status: "queued",
        operation: "export",
      }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
