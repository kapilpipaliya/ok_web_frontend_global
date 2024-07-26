// ->
import { int } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import type { ContextType } from "../../types/ContextType";

import { processResult } from "./processResult";

export async function evalGetChildren(
  vertexes: Vertex[],
  edgeType: string,
  context: ContextType = {},
) {
  "use server";
  if (!vertexes || vertexes.length === 0) return;

  const session = await getSession(context);
  const type = getEdgeType(edgeType, vertexes);
  const { query, params } = buildQuery(type, vertexes);

  try {
    const result = await runQuery(session, query, params, context.tx);
    return processResult(result.records, context, "child", "r", false);
  } catch (error) {
    handleQueryError(vertexes, error);
  } finally {
    await closeSession(session, context);
  }
}

async function getSession(context: ContextType) {
  if (context.tx) return null;
  return context.session || getSessionForSubdomain();
}

function getEdgeType(edgeType: string, vertexes: Vertex[]) {
  if (edgeType.includes("$0")) {
    return edgeType.replaceAll("$0", vertexes[0].L[0]);
  }
  return edgeType;
}

function buildQuery(type: string, vertexes: Vertex[]) {
  const parentIds = vertexes.map((v) => int(v.id));
  let query: string;
  let params: any;

  if (type === "*") {
    query = `
      MATCH (parent)-[r]->(child)
      WHERE id(parent) IN $parentIds
      RETURN r, child
    `;
    params = { parentIds };
  } else if (type.includes("|")) {
    query = `
      MATCH (parent)-[r]->(child)
      WHERE id(parent) IN $parentIds AND type(r) IN $types
      RETURN r, child
    `;
    params = { parentIds, types: type.split("|") };
  } else {
    query = `
      MATCH (parent)-[r:${type}]->(child)
      WHERE id(parent) IN $parentIds
      RETURN r, child
    `;
    params = { parentIds };
  }

  return { query, params };
}

async function runQuery(session: any, query: string, params: any, tx: any) {
  if (tx) {
    return await tx.run(query, params);
  }
  return await session.run(query, params);
}

function handleQueryError(vertexes: Vertex[], error: any) {
  console.error(
    `Error fetching children for vertex ${vertexes.map((v) => v.id).join(",")}:`,
    error,
  );
  throw error;
}

async function closeSession(session: any, context: ContextType) {
  if (!context.session && session) {
    await session.close();
  }
}
