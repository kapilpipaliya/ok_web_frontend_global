import {createStore} from "solid-js/store";

import type {EdgeMap, GlobalProperties, GraphInterface, Id, VertexMap,} from "~/lib/graph/graph";

import {addNewVertex} from "./lib/graph/mutate/vertex";

export function createAppState() {
  const graph = createGraph();

  addNewVertex(
    0,
    {
      id: "globalStoreId",
      IN: {},
      L: ["GlobalStore"],
      OUT: {},
      P: {
        activeClickOutside: [],
        initialDataFetchError: "",
        isDevelopment: false,
        newVertexId_: -500000,
        txnId_: 0,
        url: "",
        userRoles: [],
        userSettingId: "",
      } as GlobalProperties,
    },
    graph[0],
    graph[1],
  );

  addNewVertex(
    0,
    {
      id: "vertexOldIdToNewIdMap",
      IN: {},
      L: ["vertexOldIdToNewIdMap"],
      OUT: {},
      P: {},
    },
    graph[0],
    graph[1],
  );

  addNewVertex(
    0,
    {
      id: "edgeOldIdToNewIdMap",
      IN: {},
      L: ["edgeOldIdToNewIdMap"],
      OUT: {},
      P: {},
    },
    graph[0],
    graph[1],
  );

  return graph;
}

export function createGraph() {
  return createStore<GraphInterface>({
    broadcastChannels: [],
    edges: {} as EdgeMap,
    vertexes: {} as VertexMap,
    vertexLabelIdMap: {} as { [key: string]: Id[] },
  });
}
