import type { Edge, Vertex } from "~/lib/graph/graph";

import { getDriver } from "~/cypher/driver";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import {fetchFromMGAndSaveToArray} from "~/cypher/get/fetchFromMGAndSaveToArray";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

// exporting this function breaks the api
export async function getInitialData(args: { subdomain: string; }) {
  const nodeObj: Record<string, Vertex> = {};
  const relationshipObj: Record<string, Edge> = {};

  const session = (await getDriver(args.subdomain)).session();

  try {
    await fetchFromMGAndSaveToArray(
      session,
      "MATCH (n:DataType) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
      {},
      nodeObj,
      relationshipObj
    );
    await fetchFromMGAndSaveToArray(
      session,
      "MATCH (n:CompCategory) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
      {},
      nodeObj,
      relationshipObj
    );

    const form = FormMetaData.Comp;
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
    const result = await fetchDataFromMG({
      expression: `g:'Comp'`,
      incoming,
      outgoing,
    });

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
