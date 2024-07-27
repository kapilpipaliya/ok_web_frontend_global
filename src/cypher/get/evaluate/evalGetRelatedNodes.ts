import type { TransactionPromise } from "neo4j-driver-core";

import {type Session, int} from "neo4j-driver";

import type {Vertex} from "~/lib/graph/graph";

import {calculateFilter} from "~/lib/graph/get/sync/calculateFilter";

import type {ContextType} from "../../types/ContextType";

import {getSessionForSubdomain} from "../getSessionForSubdomain";
import {processResult} from "./processResult";

export async function evalGetRelatedNodes(
  vertexes: Vertex[],
  edgeType: string,
  context: ContextType,
  relationType: "child" | "g" | "id" | "parent"
) {
  if ((relationType === "child" || relationType === "parent") && (!vertexes || vertexes.length === 0)) return;

  const session = await getSession(context);

  const { params, query } = buildQuery(edgeType, vertexes, relationType);

  if (!query) return;
  try {
    const result = await runQuery(session, query, params, context.tx);
    return processResult(result.records, context, relationType, "r", relationType === "parent");
  } catch (error) {
    handleQueryError(relationType, vertexes, error);
  } finally {
    await closeSession(session, context);
  }
}

function buildQuery(edgeType: string, vertexes: Vertex[], relationType: "child" | "g" | "id" | "parent") {
  const ids = vertexes.map((v) => int(v.id));
  let query = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let params: { [key: string]: any } | undefined;

  if (relationType === "child") {
    const type = getEdgeType(edgeType, vertexes);
    if (type === "*") {
      query = `
        MATCH (parent)-[r]->(child)
        WHERE id(parent) IN $ids
        RETURN r, child
      `;
    } else if (type.includes("|")) {
      query = `
        MATCH (parent)-[r]->(child)
        WHERE id(parent) IN $ids AND type(r) IN $types
        RETURN r, child
      `;
      params = { ids, types: type.split("|") };
    } else {
      query = `
        MATCH (parent)-[r:${type}]->(child)
        WHERE id(parent) IN $ids
        RETURN r, child
      `;
    }
  } else if (relationType === "parent") {
    const type = getEdgeType(edgeType, vertexes);
    if (type.includes("|")) {
      query = `
        MATCH (parent)-[r]->(child)
        WHERE id(child) IN $ids AND type(r) IN $types
        RETURN r, parent
      `;
      params = { ids, types: type.split("|") };
    } else {
      query = `
        MATCH (parent)-[r:${type}]->(child)
        WHERE id(child) IN $ids
        RETURN r, parent
      `;
    }
  } else if (relationType === "g") {
    const searchParams = calculateFilter(edgeType);
    const label = searchParams.type ?? edgeType;
    if (!label) {
      return { error: "label must be provided." };
    }
    if (label === "ALL_LABELS") {
      query = "MATCH (g) RETURN DISTINCT labels(g)";
    } else {
      query = `MATCH (g:${label})`;
      if (searchParams.filter) {
        query += " WHERE g.name = $name";
        params = { name: searchParams.filter };
      }
      query += " RETURN g";
    }

    if (searchParams.skip) query += ` SKIP ${searchParams.skip}`;
    if (searchParams.limit) query += ` LIMIT ${searchParams.limit}`;
  } else if (relationType === "id") {
    query = "MATCH (id) WHERE id(id) = $id RETURN id";
    params = { id: edgeType };
  }

  if (!params) {
    params = { ids };
  }

  return { params, query };
}
async function getSession(context: ContextType) {
  if (context.tx) return null;
  return context.session || getSessionForSubdomain();
}

function getEdgeType(edgeType: string, vertexes: Vertex[]) {
  return edgeType.replaceAll("$0", vertexes[0].L[0]);
}

async function runQuery(session: Session | null, query: string, params: { [key: string]: any }, tx?: TransactionPromise) {
  if (tx) {
    return await tx.run(query, params);
  }
  return await session!.run(query, params);
}

function handleQueryError(action: string, vertexes: Vertex[], error: any) {
  console.error(
    `Error fetching ${action} for vertex ${vertexes.map((v) => v.id).join(", ")}:`,
    error
  );
  throw error;
}

async function closeSession(session: Session | null, context: ContextType) {
  if (!context.session && session) {
    await session.close();
  }
}

