import type { APIEvent } from "@solidjs/start/dist/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { signupAdmin } from "~/cypher/mutate/signup/signupAdmin";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { getUserEmailFromSession } from "~/server/getUserEmailFromSession";

export async function POST({ request }: APIEvent) {
  const { domain, key } = await request.json();
  const email = await getUserEmailFromSession();

  if (!email) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 401
    });
  }
  const { dbSession } = await getDBSessionForSubdomain(request);
  const user = await findUserByEmailSimple(dbSession, email);

  if (!user) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 401
    });
  }

  try {
    // Check if subdomain key already exists
    const existingKey = await dbSession.run(
      `MATCH (s:SubDomain {key: $key}) RETURN s`,
      { key }
    );

    if (existingKey.records.length > 0) {
      return new Response(JSON.stringify({ 
        error: "Subdomain with this key already exists" 
      }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    // Check if domain already exists
    const existingDomain = await dbSession.run(
      `MATCH (s:SubDomain {domain: $domain}) RETURN s`,
      { domain }
    );

    if (existingDomain.records.length > 0) {
      return new Response(JSON.stringify({ 
        error: "Domain name is already taken" 
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

    // Convert node to JSON before using it
    const newSubdomain = convertNodeToJson(result.records[0]?.get('s'));

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

    const createEdgeQuery = `
      MATCH (u:User { uuid: $uuid }), (s:SubDomain { key: $key })
      CREATE (u)-[:UserSubDomain]->(s);
    `;
    
    await dbSession.run(createEdgeQuery, { 
      key,
      uuid: user.P.uuid 
    });

    await signupAdmin(dbSession, {
      email: user.P.email,
      isSubDomainCreation: true,
      password: "",
      subDomain: key,
      username: user.P.username,
      uuid: user.P.uuid
    });

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