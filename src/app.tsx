import { ReactiveMap } from "@solid-primitives/map";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense, createSignal } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";

import "~/css/base.css";
import { LoadingContext } from "~/lib/contexts";
import { Sidebar } from "~/pages/admin_layout/sidebar/SidebarLayout";

import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/LoaderSimple";
import { Toaster } from "./components/solid-toast/src";
import { submitDataCall } from "./lib/api/api_functions";
import {
  type EdgeMap,
  GraphContext,
  type GraphInterface,
  type Id,
  type Vertex,
  type VertexMap,
} from "./lib/graph/graph";
import { mergeVertexProperties } from "./lib/graph/mutate/vertex";
import { commitTxn } from "./lib/graph/transaction/commitTxn";
import { getDefaultTxnValue } from "./lib/graph/transaction/getDefaultTxnValue";
import masterConfig from "./master.css";

const saveUserSetting = (properties: {[key: string]: any}, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) => {
  const newTxn = graph.newTxnId;
  mergeVertexProperties(newTxn, graph.userSettingId, graph, setGraph, properties);
  const data = commitTxn(newTxn, graph);
  if (!data) {
    return;
  }
  submitDataCall({ ...data }, graph, setGraph, newTxn);
};

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const loadingSite = createSignal(false);

  // we start from 500000 because newId should not conflict with existing Ids
  let newVertexId = -500000;

  let txnId = 0;

  const transactions = new ReactiveMap() as GraphInterface["transactions"];


  const graph = createStore<GraphInterface>({
    activeClickOutside: 0,
    componentIdMap: {},
    edges: {} as EdgeMap,
    isSideBarOpen: false,
    isSubSideBarOpen: false,
    member: {P: {}} as Vertex,
    navBarHeight: 45,
    navigationData: [],
    get newTxnId() {
      txnId = txnId + 1;
      transactions.set(txnId, {
        ...getDefaultTxnValue(),
        undoStepIndexes: [0],
      });
      return txnId;
    },
    get newVertexId() {
      newVertexId = newVertexId + 1;
      return newVertexId.toString();
    },
    saveUserSetting: (properties: {[key: string]: any}) => {
      saveUserSetting(properties, graph[0], graph[1]);
    },
    transactions,
    get userSetting() {
      return this.vertexes[this.userSettingId]; // NOSONAR
    },
    userSettingId: "",
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    vertexes: {} as VertexMap,
  });

  return (
    <Router
      root={(props) => {
        return (
          <CSSRuntimeProvider config={masterConfig}>
            <GraphContext.Provider value={graph}>
              <LoadingContext.Provider value={loadingSite}>
                <MetaProvider>
                  <div
                    classList={{
                      flex: graph[0].isSideBarOpen || graph[0].isSubSideBarOpen,
                    }}
                  >
                    <Show when={graph[0].isSideBarOpen}>
                      <Sidebar />
                    </Show>
                    <Suspense fallback={<LoaderNew />}>
                      {/* <ErrorBoundary fallback={(error) => {
                        return <div>Something went wrong: {error.message}</div>;
                      }}> */}
                      {props.children}
                      {/* </ErrorBoundary> */}
                    </Suspense>
                  </div>

                  <Show fallback={<Toaster />} when={loadingSite[0]()}>
                    <div class="fixed flex ai:center bg:rgba(0,0,0,0.5) h:100% jc:center left:0 top:0 w:100% z:9999">
                      <Toaster />
                    </div>
                  </Show>
                </MetaProvider>
              </LoadingContext.Provider>
            </GraphContext.Provider>
          </CSSRuntimeProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
