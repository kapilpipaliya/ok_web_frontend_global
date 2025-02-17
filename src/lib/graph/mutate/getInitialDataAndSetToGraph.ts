import type { SetStoreFunction } from "solid-js/store";

import type {
  GlobalProperties,
  GraphInterface,
  Id,
  Vertex,
} from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { getGlobalStore } from "../get/sync/getGlobalStore";
import { setGraphData } from "./setGraphData";

export function getInitialDataAndSetToGraph(
  graph: [get: GraphInterface, set: SetStoreFunction<GraphInterface>],
) {
  const getData = async () => {
    const url = getGlobalStore(graph[0]).P.url
      ? `?${getGlobalStore(graph[0]).P.url}=true`
      : "";
    const data = await getAPI(`${API.getInitialDataUrl}${url}`);
    setGraphData(graph[0], graph[1], data as any);
    return data;
  };
  return getData();
}
