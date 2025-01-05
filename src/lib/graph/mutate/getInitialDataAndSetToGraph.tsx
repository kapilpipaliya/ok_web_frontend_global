import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { setGraphData } from "./setGraphData";
import { getGlobalStore } from "../get/sync/getGlobalStore";
import { mergeVertexProperties } from "./vertex";

export function getInitialDataAndSetToGraph(
  graph: [get: GraphInterface, set: SetStoreFunction<GraphInterface>],
) {
  function setComponentIdMap(vertexes: Vertex[]) {
    const vertexMap = {} as { [key: string]: Id };
    for (const vertex of Object.values(vertexes)) {
      if (vertex.L[0] === "Comp") {
        const propName = vertex.P.key;
        const vertexId = vertex.id;
        vertexMap[propName] = vertexId;
      }
    }
    const globalStoreId = "globalStoreId";
    mergeVertexProperties(0, globalStoreId, graph[0], graph[1], { componentIdMap: vertexMap });
  }

  const getData = async () => {
    const url = getGlobalStore(graph[0]).P.url ? `?${getGlobalStore(graph[0]).P.url}=true` : '';
    const data = await getAPI(`${API.getInitialDataUrl}${url}`);
    setGraphData(graph[0], graph[1], data as any);
    setComponentIdMap(data.vertexes);
    return data;
  };
  return getData();
}
