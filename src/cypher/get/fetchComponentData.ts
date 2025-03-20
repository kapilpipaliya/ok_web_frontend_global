import type { SetStoreFunction } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";

export async function fetchComponentData(
  vertexes: Vertex[],
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const componentData = await fetchComponentDataPure(vertexes);
  if (componentData?.graph) {
    // skip existing because we not want to modify existing component data
    setGraphData(graph, setGraph, componentData.graph, { skipExisting: true });
  }
}

export async function fetchComponentDataPure(
  vertexes: Vertex[],
  // graph: GraphInterface,
) {
  const { incoming, outgoing } = getEdgesFromRowsAttr(
    FormMetaData.Component.attributes,
  );
  return await fetchDataFromDB({
    expression: `id:'${vertexes.map((v) => v.id).join("|")}'`,
    // [getGlobalStore(graph).P.url]: true,
    incoming,
    outgoing,
  });
}
