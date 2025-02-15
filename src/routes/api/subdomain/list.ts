import type { APIEvent } from "@solidjs/start/dist/server";

import { Node } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const user = await getUserFromSession();
  
  if (!user || !user.P?.email) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 401
    });
  }

  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Get subdomains for current user with their latest activity
    const result = await dbSession.run(`
      MATCH (u:User {email: $email})-[:UserSubDomain]->(s:SubDomain)
      OPTIONAL MATCH (a:Activity)
      WHERE a.entityType = 'SubDomain' AND a.entityId = s.key
      WITH s, a
      ORDER BY a.timestamp DESC
      WITH s, collect(a)[0..5] as recentActivities
      RETURN s as subdomain, recentActivities
      ORDER BY s.createdAt DESC
    `, { email: user?.P?.email });

    const subdomains = result.records.map(record => {
      const subdomainNode = convertNodeToJson(record.get('subdomain'));
      const activities = record.get('recentActivities') ? record.get('recentActivities').map((activity: Node) => convertNodeToJson(activity)) : [];
      
      return {
        ...subdomainNode,
        P: {
          ...subdomainNode.P,
          recentActivities: activities
        }
      };
    });

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