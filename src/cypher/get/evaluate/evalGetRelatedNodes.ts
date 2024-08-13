import type { TransactionPromise } from "neo4j-driver-core";

import { int, type Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { calculateFilter } from "~/lib/graph/get/sync/calculateFilter";

import type { ContextType } from "../../types/ContextType";

import { getSessionForSubdomain } from "../getSessionForSubdomain";
import { processResult } from "./processResult";

export async function evalGetRelatedNodes(
  vertexes: Vertex[],
  edgeType: string,
  context: ContextType,
  relationType: "child" | "g" | "id" | "parent",
) {
  if (
    (relationType === "child" || relationType === "parent") &&
    (!vertexes || vertexes.length === 0)
  ) {
    return;
  }

  const session = await getSession(context);

  const { params, query } = buildQuery(edgeType, vertexes, relationType);

  if (!query) {
    return;
  }
  try {
    const result = await runQuery(session, query, params, context.tx);
    if (params.allLabels) {
      return result.records.map((record) => record.get(0)[0]);
    }
    return processResult(
      result.records,
      context,
      "n",
      relationType === "parent" || relationType === "child" ? "r" : "",
      relationType === "parent",
    );
  } catch (error) {
    handleQueryError(relationType, vertexes, error);
  } finally {
    await closeSession(session, context);
  }
}

function buildQuery(
  edgeType: string,
  vertexes: Vertex[],
  relationType: "child" | "g" | "id" | "parent",
) {
  const ids = vertexes.map((v) => int(v.id));
  let query = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let params: { [key: string]: any } | undefined;

  if (relationType === "child") {
    const type = getEdgeType(edgeType, vertexes);
    if (type === "*") {
      query = `
        MATCH (parent)-[r]->(n)
        WHERE id(parent) IN $ids
        RETURN r, n
      `;
    } else if (type.includes("|")) {
      query = `
        MATCH (parent)-[r]->(n)
        WHERE id(parent) IN $ids AND type(r) IN $types
        RETURN r, n
      `;
      params = { ids, types: type.split("|") };
    } else {
      query = `
        MATCH (parent)-[r:${type}]->(n)
        WHERE id(parent) IN $ids
        RETURN r, n
      `;
    }
  } else if (relationType === "parent") {
    const type = getEdgeType(edgeType, vertexes);
    if (type.includes("|")) {
      query = `
        MATCH (n)-[r]->(child)
        WHERE id(child) IN $ids AND type(r) IN $types
        RETURN r, n
      `;
      params = { ids, types: type.split("|") };
    } else {
      query = `
        MATCH (n)-[r:${type}]->(child)
        WHERE id(child) IN $ids
        RETURN r, n
      `;
    }
  } else if (relationType === "g") {
    const searchParams = calculateFilter(edgeType);
    const label = searchParams.type ?? edgeType;
    if (!label) {
      return { error: "label must be provided." };
    }
    if (label === "ALL_LABELS") {
      query = "MATCH (n) RETURN DISTINCT labels(n)";
      params = { allLabels: true };
    } else {
      query = `MATCH (n:${label})`;
      if (searchParams.filter) {
        query += " WHERE n.name = $name";
        params = { name: searchParams.filter };
      }
      query += " RETURN n";
    }

    if (searchParams.skip) {
      query += ` SKIP ${searchParams.skip}`;
    }
    if (searchParams.limit) {
      query += ` LIMIT ${searchParams.limit}`;
    }
  } else if (relationType === "id") {
    query = "MATCH (n) WHERE id(n) = $id RETURN n";
    params = { id: int(edgeType) };
  }

  if (!params) {
    params = { ids };
  }

  return { params, query };
}
async function getSession(context: ContextType) {
  if (context.tx) {
    return null;
  }
  return context.session || getSessionForSubdomain();
}

function getEdgeType(edgeType: string, vertexes: Vertex[]) {
  return edgeType.replaceAll("$0", vertexes[0].L[0]);
}

async function runQuery(
  session: null | Session,
  query: string,
  params: { [key: string]: any },
  tx?: TransactionPromise,
) {
  if (tx) {
    return await tx.run(query, params);
  }
  return await session!.run(query, params);
}

function handleQueryError(action: string, vertexes: Vertex[], error: any) {
  console.error(
    `Error fetching ${action} for vertex ${vertexes.map((v) => v.id).join(", ")}:`,
    error,
  );
  throw error;
}

async function closeSession(session: null | Session, context: ContextType) {
  if (!context.session && session) {
    await session.close();
  }
}


// typed-neo4j/src/db.ts
/*async function find<T extends Record<string, unknown>, V extends keyof VertexSchema>(
  label: V,
  props: V extends keyof VertexSchema
    ? Partial<VertexSchema[V]>
    : T = {} as V extends keyof VertexSchema ? Partial<VertexSchema[V]> : T,
  config: {
    limit?: number;
    skip?: number;
    order?: { [key in keyof T]?: "asc" | "desc" };
  } = {},
): Promise<(Vertex & (V extends keyof VertexSchema ? VertexSchema[V] : T))[]> {
  const keys = Object.keys(props);
  props = convert.neo4j(props);

  const results = await this.run(
    `MATCH (n:${String(label)} { ${keys
      .map((key) => `${key}: $${key}`)
      .join(", ")} }) RETURN n ${
      config.order
        ? `ORDER BY ${Object.entries(config.order)
            .map(([key, order]) => `n.${key} ${order}`)
            .join(", ")}`
        : ""
    } ${config.limit ? `LIMIT ${config.limit}` : ""} ${
      config.skip ? `SKIP ${config.skip}` : ""
    }`,
    props,
  );

  const items: Node[] = results.records.map((record) => record.get("n"));

  return items.map((item) => ({
    $id: item.elementId,
    ...item.properties,
  })) as (Vertex & (V extends keyof VertexSchema ? VertexSchema[V] : T))[];
}*/