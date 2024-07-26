import { int, Session, QueryResult, RecordShape, Integer } from "neo4j-driver";
import type { TransactionPromise } from "neo4j-driver-core";

import { convertNodeToJson } from "~/lib/convertNodeToJson";

import type { ContextType } from "../../types/ContextType";

import { getSessionForSubdomain } from "../getSessionForSubdomain";

export async function findVertexMGCallId(
  {
    id,
    label,
    limit,
    name,
    skip,
  }: {
    id?: string;
    label?: string;
    limit?: number;
    name?: string;
    skip?: number;
  },
  context: ContextType = {},
) {
  if (!id && !label) {
    return { error: "Either 'id' or 'label' must be provided." };
  }

  const { query, params } = buildQueryAndParams({ id, label, name, limit, skip });
  const session = await getSession(context);

  try {
    const result = await runQuery(session, query, params, context.tx);
    return processResult(result, label!, context);
  } catch (error) {
    console.error("Error in findVertexMGCallId:", error);
    throw error;
  } finally {
    await closeSession(session, context);
  }
}

function buildQueryAndParams({ id, label, name, limit, skip }: {
  id?: string;
  label?: string;
  limit?: number;
  name?: string;
  skip?: number;
}) {
  let query = "";
  const params: { id?: Integer; name?: string } = {};

  if (id) {
    query = "MATCH (n) WHERE id(n) = $id RETURN n";
    params.id = int(id);
  } else if (label) {
    if (label === "ALL_LABELS") {
      query = "MATCH (n) RETURN DISTINCT labels(n)";
    } else {
      query = `MATCH (n:${label})`;
      if (name) {
        query += " WHERE n.name = $name";
        params.name = name;
      }
      query += " RETURN n";
    }
  }

  if (skip) query += ` SKIP ${skip}`;
  if (limit) query += ` LIMIT ${limit}`;

  return { query, params };
}

async function getSession(context: ContextType) {
  if (context.tx) return null;
  return context.session || getSessionForSubdomain();
}

async function runQuery(session: Session | null, query: string, params: { [key: string]: any }, tx?: TransactionPromise) {
  if (tx) {
    return await tx.run(query, params);
  }
  return await session!.run(query, params);
}

function processResult(result: QueryResult<RecordShape>, label: string, context: ContextType) {
  if (label === "ALL_LABELS") {
    return result.records.map((record) => record.get(0)[0]);
  }

  return result.records.map((record) => {
    const vertex = convertNodeToJson(record.get("n"));
    if (context.nodes) {
      context.nodes[vertex.id] = vertex;
    }
    return vertex;
  });
}

async function closeSession(session: Session | null, context: ContextType) {
  if (!context.session && session) {
    await session.close();
  }
}
