import type { Config } from "@master/css";

import { ReactiveMap } from "@solid-primitives/map";
import { MetaProvider } from "@solidjs/meta";
import { Router, } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Toaster } from "solid-toast";

import { LoadingContext } from "~/lib/contexts";
import { Sidebar } from "~/pages/dashboard/sidebar/SidebarLayout";

import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/LoaderSimple";
import { type EdgeMap, GraphContext, type GraphInterface, type Id, type VertexMap, } from "./lib/graph/graph";

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const config: Config = {
    animations: {},
    functions: {},
    rules: {},
    selectors: {},
    styles: {},
    variables: {},
  };

  const loadingSite = createSignal(false);

  const graph = createStore<GraphInterface>({
    activeClickOutside: 0,
    componentIdMap: {},
    edges: {} as EdgeMap,
    isSideBarOpen: true,
    isSubSideBarOpen: true,
    member: {},
    navigationData: [],
    transactions: new ReactiveMap(),
    txnId: 0,
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    vertexes: {} as VertexMap
  });

  return (
    <Router
      root={(props) => {
        return (
          <CSSRuntimeProvider config={config}>
            <GraphContext.Provider value={graph}>
              <LoadingContext.Provider value={loadingSite}>
                <MetaProvider>
                  <div id="popup-root" />
                  <div id="mainDiv">
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
                    <div
                      style={{
                        "align-items": "center",
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        height: "100%",
                        "justify-content": "center",
                        left: "0",
                        position: "fixed",
                        top: "0",
                        width: "100%",
                        "z-index": "9999",
                      }}
                    >
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
