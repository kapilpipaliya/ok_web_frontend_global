import type { Session } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { ServerResult } from "../types/ServerResult";
import { fetchFromMGAndSaveToArray } from "./fetchFromMGAndSaveToArray";

// exporting this function breaks the api
export async function getInitialData(dbSession: Session) {
  const nodeObj: Record<string, Vertex> = {};
  const relationshipObj: Record<string, Edge> = {};

  try {
    // await fetchFromMGAndSaveToArray(
    //   dbSession,
    //   "MATCH (n:DataType) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
    //   {},
    //   nodeObj,
    //   relationshipObj,
    // );
    // await fetchFromMGAndSaveToArray(
    //   dbSession,
    //   "MATCH (n:CompCategory) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
    //   {},
    //   nodeObj,
    //   relationshipObj,
    // );

    // await fetchAndSaveFormMetaData("Comp", nodeObj, relationshipObj, dbSession);
    // await fetchAndSaveFormMetaData("CompExample", nodeObj, relationshipObj, dbSession);

    await fetchFromMGAndSaveToArray(
      dbSession,
      "MATCH (n:GlobalSetting)  OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
      {},
      nodeObj,
      relationshipObj,
    );
    // load global setting and theme
    // await fetchAndSaveFormMetaData(
    //   "GlobalSetting",
    //   nodeObj,
    //   relationshipObj,
    //   dbSession,
    // );
  } catch (error: any) {
    return { error: error.message };
  }

  return {
    graph: {
      edges: relationshipObj,
      vertexes: nodeObj,
    },
    timestamp: new Date().getTime(),
  } as ServerResult;
}

async function fetchAndSaveFormMetaData(
  formName: string,
  nodeObj: Record<string, Vertex>,
  relationshipObj: Record<string, Edge>,
  dbSession: Session,
) {
  const form = FormMetaData[formName];
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
  const result = await fetchDataFromMG(
    {
      expression: `g:'${formName}'`,
      incoming,
      outgoing,
    },
    { dbSession, nodes: nodeObj, relationships: relationshipObj },
    false,
  );

  if (result.graph) {
    // TODO: modify so it not break existing edges and vertexes
    Object.assign(nodeObj, result.graph.vertexes);
    Object.assign(relationshipObj, result.graph.edges);
  }
}
