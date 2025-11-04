import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { downloadCompanyFavicon } from "~/routes/api/file/downloadCompanyFaviconFn";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    return await downloadCompanyFavicon(dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
