import type { APIEvent } from "@solidjs/start/dist/server";

import { type Session, types } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { convertNodeToJson, convertRelationshipToJson } from "~/cypher/convertNodeToJson";
import { getDriver } from "~/cypher/driver";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { getSubDomain } from "~/server/getSubDomain";

// exporting this function breaks the api
async function getInitialData(args: { subdomain: string }) {
  const nodeObj: Record<string, Vertex> = {};
  const relationshipObj: Record<string, Edge> = {};

  const session = (await getDriver(args.subdomain)).session();
  
  try {
    await fetchFromMGAndSaveToArray(session, 'MATCH (n:DataType) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m', {}, nodeObj, relationshipObj);
    await fetchFromMGAndSaveToArray(session, 'MATCH (n:CompCategory) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m', {}, nodeObj, relationshipObj);

    const form = FormMetaData.Comp;
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
    const result = await fetchDataFromMG({ expression: `g:'Comp'`, incoming, outgoing });

    if (result.graph) {
      Object.assign(nodeObj, result.graph.vertexes);
      Object.assign(relationshipObj, result.graph.edges);
    }
  } finally {
    await session.close(); // Ensure the session is always closed
  }

  return {
    edges: relationshipObj,
    timestamp: new Date().getTime(),
    vertexes: nodeObj,
  };
}

async function fetchFromMGAndSaveToArray(
  session: Session,
  query: string,
  params: Record<string, unknown>,
  nodeObj: Record<string, Vertex>,
  relationshipObj: Record<string, Edge>,
): Promise<void> {
  try {
    const result = await session.run(query, params);
    for (const record of result.records) {
      record.forEach((value) => {
        if (value instanceof types.Node) {
          const id = value.elementId;
          nodeObj[id] = convertNodeToJson(value);
        } else if (value instanceof types.Relationship) {
          const id = value.elementId;
          relationshipObj[id] = convertRelationshipToJson(value);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            const id = item.elementId;
            if (item instanceof types.Node) {
              nodeObj[id] = convertNodeToJson(item);
            } else if (item instanceof types.Relationship) {
              relationshipObj[id] = convertRelationshipToJson(item);
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("Failed to execute query:", query, "Error:", error);
    throw error;
  }
}

export async function GET({ request }: APIEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);

  try {
    const data = await getInitialData({ subdomain });
    return data;
  } catch (error) {
    console.error("Failed to get Initial Data", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}