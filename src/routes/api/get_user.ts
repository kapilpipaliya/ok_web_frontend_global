import type { APIEvent } from "@solidjs/start/dist/server";
import type { Node } from "neo4j-driver";

import { getDriver } from "~/cypher/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import { getHttpsSession } from "~/server/getHttpsSession";
import { getSubDomain } from "~/server/getSubDomain";

// Main POST function
export async function GET({ request }: APIEvent) {
  const subdomainFromUrl = await getSubDomain(request.headers.get("host")!);
  const neo4jSession = (await getDriver(subdomainFromUrl)).session();
  try {
    const httpSession = await getHttpsSession();
    if (httpSession.data?.subdomain === undefined) {
      return { error: "Not Authorized Domain" };
    }
    // session only works with https
    const email = httpSession.data.email;
    if (email === undefined) {
      return { error: "Not Authorized Email or username" };
    }
    const query = "MATCH (u:User) WHERE u.email = $email OR u.username = $email RETURN u";
    const result = await neo4jSession.run(query, { email: email });

    if (result.records.length === 0) {
      return { error: `Not Authorized Email or username ${email}` };
    }
    const user = result.records[0].get("u") as Node;
    const { password, ...properties } = convertNodeToJson(user).P;

    return {
      id: user.elementId,
      properties,
    };
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
