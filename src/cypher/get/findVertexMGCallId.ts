import {int, type Session} from "neo4j-driver";
import type {Edge, Vertex} from "~/lib/graph/graph";
import {convertNodeToJson} from "~/lib/convertNodeToJson";

export async function findVertexMGCallId(
  session: Session,
  {
    id,
    label,
    skip,
    limit,
    name,
  }: {
    id?: string;
    label?: string;
    skip?: number;
    limit?: number;
    name?: string;
  },
  {
    nodes,
    relationships,
  }: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
  } = {},
) {
  let query: string | undefined;
  const params = {} as { name?: string; id: any };

  if (id) {
    query = "MATCH (n) WHERE id(n) = $id RETURN n";
    params.id = int(id);
  } else if (label) {
    if (name) {
      query = `MATCH (n:${label}) WHERE n.name = $name RETURN n`;
      params.name = name;
    } else {
      query = `MATCH (n:${label}) RETURN n`;
    }
  }

  if (name || skip || limit) {
    if (skip) {
      query += ` SKIP ${skip}`;
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }
  }
  if (!query) {
    throw new Error("Either 'id' or 'label' must be provided.");
  }

  const result = await session.run(query, params);
  return result.records.map((record) => {
    const vertex = convertNodeToJson(record.get("n"));
    if (nodes) {
      nodes[vertex.id] = vertex;
    }
    return vertex;
  });
}