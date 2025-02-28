import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";

export async function fetchComponentData(
  vertexes: Vertex[],
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const { incoming, outgoing } = getEdgesFromRowsAttr(
    FormMetaData.Component.attributes,
  );
  const componentData = await fetchDataFromMG({
    expression: `id:'${vertexes.map((v) => v.id).join("|")}'`,
    [getGlobalStore(graph).P.url]: true,
    incoming,
    outgoing,
  });
  if (componentData?.graph) {
    // skip existing because we not want to modify existing component data
    setGraphData(graph, setGraph, componentData.graph, { skipExisting: true });
  }
}
