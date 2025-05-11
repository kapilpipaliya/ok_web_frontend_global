import type { SetStoreFunction } from "solid-js/store";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function fetchComponentData(
  vertexes: Vertex[],
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const componentData = await fetchComponentDataPure(vertexes);
  if (componentData?.graph) {
    // skip existing because we not want to modify existing component data
    // setGraphData(graph, setGraph, componentData.graph, { skipExisting: true });
  }
  return componentData;
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
