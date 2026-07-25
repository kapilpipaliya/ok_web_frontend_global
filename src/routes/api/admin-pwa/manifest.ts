import type { APIEvent } from "@solidjs/start/server";

import { getSubdomainForRequest } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { buildAdminPwaManifest } from "~/lib/pwa/buildAdminPwaManifest";

export async function GET({ request }: APIEvent) {
  try {
    const { subDomain } = await getSubdomainForRequest(request);
    const manifest = buildAdminPwaManifest(subDomain);

    return new Response(JSON.stringify(manifest), {
      status: 200,
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    handleAPIError(error);
    return new Response(JSON.stringify(buildAdminPwaManifest("admin")), {
      status: 200,
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
}
