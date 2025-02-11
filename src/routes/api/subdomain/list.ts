import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Get all subdomains with their latest activity
    const result = await dbSession.run(`
      MATCH (s:SubDomain)
      OPTIONAL MATCH (a:Activity)
      WHERE a.entityType = 'SubDomain' AND a.entityId = s.key
      WITH s, a
      ORDER BY a.timestamp DESC
      WITH s, collect(a)[0] as latestActivity
      RETURN {
        key: s.key,
        domain: s.domain,
        status: s.status,
        createdAt: s.createdAt,
        lastModified: s.lastModified,
        latestActivity: CASE 
          WHEN latestActivity IS NOT NULL 
          THEN {
            action: latestActivity.action,
            timestamp: latestActivity.timestamp,
            details: latestActivity.details
          }
          ELSE null
        END
      } as subdomain
      ORDER BY s.createdAt DESC
    `);

    const subdomains = result.records.map(record => record.get('subdomain'));

    return new Response(JSON.stringify({ 
      subdomains
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

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