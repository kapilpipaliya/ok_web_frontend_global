import { getDriver, isIntegerId } from "~/cypher_api/server/driver";
import { APIEvent } from "@solidjs/start/dist/server";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";
import { Node } from "neo4j-driver";

// Main POST function
export async function GET({ request }: APIEvent) {
  const subdomainFromUrl = getSubDomain(request.headers.get("host")!);
  const neo4jSession = (await getDriver(subdomainFromUrl)).session();
  try {
    const httpSession = await getHttpsSession();
    if (httpSession.data?.subdomain === undefined) {
      return { error: "Not Authorized Domain" };
    }
    // session only works with https
    const email = httpSession.data.email;
    if (email === undefined) {
      return { error: "Not Authorized Email" };
    }
    const query = `MATCH (u:User {email: $email}) return u;`;
    const result = await neo4jSession.run(query, { email: email });

    if (result.records.length === 0) {
      return { error: `Not Authorized Email ${email}` };
    }
    const user = result.records[0].get("u") as Node;
    const { password, ...properties } = user.properties;

    return {
      id: !isIntegerId ? user.identity.toNumber() : user.identity,
      properties,
    };
  } catch (error: any) {
    console.error("Server error Failed to login:", error);
    return new Response(error.message, { status: 500 });
  }
}
