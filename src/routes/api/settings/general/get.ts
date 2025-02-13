import type { APIEvent } from "@solidjs/start/dist/server";
import { checkAdminRole } from "~/server/checkAdminRole";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function GET({ request }: APIEvent) {
  const isAdmin = await checkAdminRole(request);
  
  if (!isAdmin) {
    return new Response(JSON.stringify({
      error: "Unauthorized. Admin access required."
    }), {
      headers: { "Content-Type": "application/json" },
      status: 403
    });
  }

  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const result = await dbSession.run(
      `MATCH (s:GlobalSetting)
       OPTIONAL MATCH (s)-[:CompanyLogo]->(logo:File)
       RETURN s as settings, logo as companyLogo`
    );

    const node = result.records[0]?.get('settings');
    const logoNode = result.records[0]?.get('companyLogo');
    const settings = node ? convertNodeToJson(node) : null;
    const companyLogo = logoNode ? convertNodeToJson(logoNode) : null;

    return { companyLogo, settings };

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  } finally {
    await dbSession.close();
  }
} 