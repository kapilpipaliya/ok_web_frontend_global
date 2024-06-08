import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal, onMount, Show, Suspense } from "solid-js";
import { Toaster } from "solid-toast";
import { LoadingContext } from "~/lib/contexts";
import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/custom/LoaderSimple";
import type { Config } from "@master/css";
import Sidebar from "~/pages/dashboard/sidebar/SidebarLayout";
import {
  type EdgeMap,
  GraphContext,
  type GraphInterface,
  type Id,
  type VertexMap,
} from "./lib/graph/graph";
import { createStore } from "solid-js/store";
import { API } from "~/lib/api/endpoints";
import { setGraphData } from "~/lib/websocket/ws_events";

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const config: Config = {
    styles: {},
    rules: {},
    variables: {},
    animations: {},
    selectors: {},
    functions: {},
  };

  const loadingSite = createSignal(false);

  const graph = createStore<GraphInterface>({
    vertexes: {} as VertexMap,
    edges: {} as EdgeMap,
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    member: {},
    navigationData: [],
    txnId: 0,
    isSideBarOpen: true,
    isSubSideBarOpen: true,
  });


 const getdata = async () => {
  try {
   const response = await fetch(API.fetchDataUrl);
   const data = await response.json();
   setGraphData(graph[0], graph[1], data);
   return data;
  } catch (error) {
   throw error;
  }
 };
 onMount(() => {
  getdata();
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
                    
                  }}>
                </ErrorBoundary> */}
                      {props.children}
                    </Suspense>
                  </div>

                  <Show when={loadingSite[0]()} fallback={<Toaster />}>
                    <div
                      style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        "justify-content": "center",
                        "align-items": "center",
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
