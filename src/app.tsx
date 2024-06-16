import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal, ErrorBoundary, onMount, Show, Suspense } from "solid-js";
import { Toaster } from "solid-toast";
import { LoadingContext } from "~/lib/contexts";
import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/LoaderSimple";
import type { Config } from "@master/css";
import { Sidebar } from "~/pages/dashboard/sidebar/SidebarLayout";
import { type EdgeMap, GraphContext, type GraphInterface, type Id, type VertexMap, } from "./lib/graph/graph";
import { createStore } from "solid-js/store";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";

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
  const [initialDataLoading, setInitialDataLoading] = createSignal(true);

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
  onMount(async () => {
    const data = await getInitialDataAndSetToGraph(graph);
    if (data) {
      setInitialDataLoading(false);
    }
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
                      <Show when={!initialDataLoading()} fallback={<LoaderNew />}>
                        {props.children}
                      </Show>
                      {/* </ErrorBoundary> */}
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
