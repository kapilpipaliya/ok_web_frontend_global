
import type { APIEvent } from "@solidjs/start/server";
import type { Node, Relationship } from "neo4j-driver";

import { format } from "date-fns";
import { mkdirSync, writeFileSync } from "fs";

import { getDriver } from "~/cypher/driver";
import { getSubDomain } from "~/server/getSubDomain";

export async function saveGraphToCypherQL() {
  const subdomain = "default"; // Adjust this as needed
  const session = (await getDriver(subdomain)).session();

  try {
    const query = "MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m";
    const result = await session.run(query);

    if (result.records.length === 0) {
      throw new Error("No nodes or relationships found in the database.");
    }

    const nodes = new Set<Node>();
    const relationships = new Set<Relationship>();
    result.records.forEach(record => {
      const node = record.get("n");
      const relationship = record.get("r");
      const relatedNode = record.get("m");

      if (node) nodes.add(node);
      if (relationship) relationships.add(relationship);
      if (relatedNode) nodes.add(relatedNode);
    });

    const timestamp = format(new Date(), "yyyyMMddHHmmss");
    const folderPath = `./cypherql_backups/${timestamp}`;
    mkdirSync(folderPath, { recursive: true });

    nodes.forEach(node => {
      const nodeId = node.elementId;
      const nodeCypherQL = `CREATE (n${node.labels.length ? `:${node.labels.join(":")}` : ""} ${JSON.stringify(node.properties)})`;
      writeFileSync(`${folderPath}/node_${nodeId}.cypherql`, nodeCypherQL);
    });

    relationships.forEach((relationship) => {
      const relationshipId = relationship.elementId;
      const startNodeId = relationship.startNodeElementId;
      const endNodeId = relationship.endNodeElementId;
      const relationshipCypherQL = `MATCH (a), (b) WHERE id(a) = ${startNodeId} AND id(b) = ${endNodeId} CREATE (a)-[r:${relationship.type} ${JSON.stringify(relationship.properties)}]->(b)`;
      writeFileSync(`${folderPath}/relationship_${relationshipId}.cypherql`, relationshipCypherQL);
    });

    console.log(`Graph has been saved to ${folderPath}`);
  } catch (error) {
    console.error("Error saving graph to CypherQL:", error);
  } finally {
    await session.close();
  }
}



export async function GET({ request }: APIEvent) {
    // const { formName, formId } = await request.json();
    const subdomain = await getSubDomain(request.headers.get("host")!);
  
    try {
      return saveGraphToCypherQL();
    } catch (error) {
      console.error("Failed to backup all users", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
  