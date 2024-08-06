import {ReactiveMap} from "@solid-primitives/map";
import {createStore} from "solid-js/store";

import type {EdgeMap, GraphInterface, Id, Vertex, VertexMap} from "~/lib/graph/graph";

import {getDefaultTxnValue} from "~/lib/graph/transaction/getDefaultTxnValue";
import {saveUserSetting} from "~/saveUserSetting";

import { addNewVertex, newVertex } from "./lib/graph/mutate/vertex";
import masterConfig from "./master.css";


export function configureState() {
  let newVertexId = -500000;
  let txnId = 0;

  const transactions = new ReactiveMap() as GraphInterface["transactions"];

  const graph = createStore<GraphInterface>({
    activeClickOutside: 0,
    APP_BASE_URL: '/admin',
    componentIdMap: {},
    edges: {} as EdgeMap,
    events: {
      // setTitle: (title:string) =>
      // ?mergeVertexProperties(0, navBarVertexId, graph, setGraph, { title }),
    },
    globalTheme: {} as Vertex,
    isDevelopment: true,
    isLoadingPage: false,
    isSideBarOpen: false,
    isSubSideBarOpen: false,
    member: {P: {}} as Vertex,
    navBarHeight: 45,
    navigationData: [],
    get newTxnId() {
      txnId += 1;
      transactions.set(txnId, {
        ...getDefaultTxnValue(),
        undoStepIndexes: [0],
      });
      return txnId;
    },
    get newVertexId() {
      newVertexId += 1;
      return newVertexId.toString();
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
  });
  const newGlobalThemeVertexObj = newVertex(graph[0].newVertexId, ["GlobalTheme"], masterConfig);
  addNewVertex(0, newGlobalThemeVertexObj, graph[0], graph[1]);
  graph[1]('globalTheme', graph[0].vertexes[newGlobalThemeVertexObj.id])

  return graph;
}