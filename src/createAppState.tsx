import { createStore } from "solid-js/store";

import type {
  EdgeMap,
  GlobalProperties,
  GraphInterface,
  Id,
  Vertex,
  VertexMap,
} from "~/lib/graph/graph";
import { addNewVertex } from "./lib/graph/mutate/vertex";

export function createAppState() {
  const graph = createStore<GraphInterface>({
    edges: {} as EdgeMap,
    vertexes: {} as VertexMap,
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    broadcastChannels: [],
  });

  addNewVertex(0, {
    id: "globalStoreId",
    L: ["GlobalStore"],
    P: {
      activeClickOutside: [],
      componentIdMap: {},
      globalThemeId: "",
      isDevelopment: false,
      isLoadingPage: false,
      navBarHeight: 45,
      navigationData: [],
      newVertexId_: -500000,
      txnId_: 0,
      userRoles: [],
      userSettingId: "",
      url: "",
      initialDataFetchError: "",
    } as GlobalProperties,
    IN: {},
    OUT: {}
  }, graph[0], graph[1]);

  addNewVertex(0, {
    id: "vertexOldIdToNewIdMap",
    L: ["vertexOldIdToNewIdMap"],
    P: {},
    IN: {},
    OUT: {}
  }, graph[0], graph[1]);

  addNewVertex(0, {
    id: "edgeOldIdToNewIdMap",
    L: ["edgeOldIdToNewIdMap"],
    P: {},
    IN: {},
    OUT: {}
  }, graph[0], graph[1]);

  return graph;
}
