import type {APIEvent} from "@solidjs/start/dist/server";
import type {Session} from "neo4j-driver";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import {password} from "~/routes/api/profile/password";
import {pricing} from "~/routes/api/profile/pricing";
import {supportTicket} from "~/routes/api/profile/supportTicket";
import {updateProfile} from "~/routes/api/profile/updateProfile";

async function handleRequest(
  func: (payload: any, session: Session, subDomain: string) => Promise<Record<string, any>>,
  params: Record<string, any>,
  dbSession: Session,
  subDomain: string,
) {
  try {
    return await func(params, dbSession, subDomain);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  } finally {
    await dbSession.close();
  }
}

export async function POST({ request }: APIEvent) {
  const { panel, ...payload } = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  if (!panel) {
    return { error: "Missing panel" };
  }

  switch (panel) {
    case "password":
      return handleRequest(password, payload, dbSession, subDomain);
    case "pricing":
      return handleRequest(pricing, payload, dbSession, subDomain);
    case "profile":
      return handleRequest(updateProfile, payload, dbSession, subDomain);
    case "supportTicket":
      return handleRequest(supportTicket, payload, dbSession, subDomain);
    default:
      return { error: "Invalid action" };
  }
}

