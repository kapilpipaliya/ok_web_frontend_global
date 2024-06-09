import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal, onMount, Show, Suspense } from "solid-js";
import { Toaster } from "solid-toast";
import { LoadingContext } from "~/lib/contexts";
import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/LoaderSimple";
import type { Config } from "@master/css";
import Sidebar from "~/pages/dashboard/sidebar/SidebarLayout";
import {
  type EdgeMap,
  GraphContext,
  type GraphInterface,
  type Id,
  type VertexMap,
  Vertex,
} from "./lib/graph/graph";
import { createStore } from "solid-js/store";
import { API } from "~/lib/api/endpoints";
import { setGraphData } from "~/lib/websocket/ws_events";
import getAPI from "./lib/api/getApi";

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
    componentIdMap: {},
  });

  function setComponentIdMap(vertexes: Vertex[]) {
    const vertexMap = {} as { [key: string]: Id; };
    for (const vertex of Object.values(vertexes)) {
      if (vertex.L[0] === 'Comp') {
        const propName = vertex.P.name;
        const vertexId = vertex.id;
        vertexMap[propName] = vertexId;
      }
    };
    graph[1]('componentIdMap', vertexMap);
  }

  const getData = async () => {
    try {
      const response = await fetch(API.getInitialDataUrl);
      const data = await response.json();
      setGraphData(graph[0], graph[1], data);
      setComponentIdMap(data.vertexes);
      return data;
    } catch (error) {
      throw error;
    }
  };
  onMount(() => {
    getData();
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
