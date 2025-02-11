import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function POST({ request }: APIEvent) {
  const { domain, key } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Check if subdomain already exists
    const existingDomain = await dbSession.run(
      `MATCH (s:SubDomain {key: $key}) RETURN s`,
      { key }
    );

    if (existingDomain.records.length > 0) {
      return new Response(JSON.stringify({ 
        error: "Subdomain with this key already exists" 
      }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    // Create new subdomain
    const result = await dbSession.run(
      `CREATE (s:SubDomain {
        key: $key,
        domain: $domain,
        status: "active",
        createdAt: datetime(),
        lastModified: datetime()
      }) RETURN s`,
      { domain, key }
    );

    // Log activity
    await dbSession.run(
      `CREATE (a:Activity {
        action: "create",
        entityType: "SubDomain",
        entityId: $key,
        timestamp: datetime(),
        details: $details
      })`,
      { 
        details: `Created subdomain ${key} with domain ${domain}`,
        key
      }
    );

    const newSubdomain = result.records[0]?.get('s').properties;

    return new Response(JSON.stringify({ 
      subdomain: newSubdomain,
      success: true
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