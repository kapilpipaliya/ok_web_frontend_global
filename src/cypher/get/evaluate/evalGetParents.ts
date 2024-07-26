// <-
import { int } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import type { ContextType } from "../../types/ContextType";

import { processResult } from "./processResult";

export async function evalGetParents(
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
    return processResult(result.records, context, "parent", "r", true);
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
  return edgeType.replaceAll("$0", vertexes[0].L[0]);
}

function buildQuery(type: string, vertexes: Vertex[]) {
  const childIds = vertexes.map((v) => int(v.id));
  let query: string;
  let params: any;

  if (type.includes("|")) {
    query = `
      MATCH (parent)-[r]->(child)
      WHERE id(child) IN $childIds AND type(r) IN $types
      RETURN r, parent
    `;
    params = { childIds, types: type.split("|") };
  } else {
    query = `
      MATCH (parent)-[r:${type}]->(child)
      WHERE id(child) IN $childIds
      RETURN r, parent
    `;
    params = { childIds };
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
    `Error fetching parents for vertex ${vertexes.map((v) => v.id).join(", ")}:`,
    error,
  );
  throw error;
}

async function closeSession(session: any, context: ContextType) {
  if (!context.session && session) {
    await session.close();
  }
}
