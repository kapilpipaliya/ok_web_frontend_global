import { ReactiveMap } from "@solid-primitives/map";
import { createStore } from "solid-js/store";

import type {
  EdgeMap,
  GraphInterface,
  Id,
  Vertex,
  VertexMap,
} from "~/lib/graph/graph";

import { saveUserSetting } from "~/lib/api/saveUserSetting";
import { getDefaultTxnValue } from "~/lib/graph/transaction/getDefaultTxnValue";

export function createAppState() {
  const transactions = new ReactiveMap() as GraphInterface["transactions"];

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
    newTxnId(): number {
      graph[1]("txnId_", (txnId: number) => txnId + 1);
      transactions.set(graph[0].txnId_, {
        ...getDefaultTxnValue(),
        undoStepIndexes: [0],
      });
      return graph[0].txnId_ as number;
    },
    newVertexId(): string {
      graph[1]("newVertexId_", (newVertexId: number) => newVertexId + 1);
      return graph[0].newVertexId_.toString();
    },
    saveUserSetting: (properties: { [key: string]: any }) => {
      saveUserSetting(properties, graph[0], graph[1]);
    },
    transactions,
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
