import {getDBSessionForSubdomain} from "~/cypher/session/getSessionForSubdomain";
import {downloadCompanySquareLogo} from "~/routes/api/file/downloadCompanySquareLogoFn";
import {handleAPIError} from "~/lib/api/server/apiErrorHandler";
import type {APIEvent} from "@solidjs/start/server";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    return await downloadCompanySquareLogo(dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
