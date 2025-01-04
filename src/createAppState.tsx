import { ReactiveMap } from "@solid-primitives/map";
import { createStore } from "solid-js/store";

import type {
  EdgeMap,
  GraphInterface,
  Id,
  Vertex,
  VertexMap,
} from "~/lib/graph/graph";

export function createAppState() {
  const graph = createStore<GraphInterface>({
    activeClickOutside: [],
    APP_BASE_URL: "/admin",
    componentIdMap: {},
    edges: {} as EdgeMap,
    events: {},
    globalThemeId: "",
    isDevelopment: false,
    isLoadingPage: false,
    member: { P: {} } as Vertex,
    navBarHeight: 45,
    navigationData: [],
    newVertexId_: -500000,
    txnId_: 0,
    broadcastChannels: [],
    userRoles: [],
    get userSetting() {
      return this.vertexes[this.userSettingId]; // NOSONAR
    },
    userSettingId: "",
    vertexes: {} as VertexMap,
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    url: "",
  });

  return graph;
}
