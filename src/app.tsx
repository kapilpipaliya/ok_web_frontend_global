import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

import "~/base.css";
import { createSignal, Show, Suspense } from "solid-js";

import { createAppState } from "~/createAppState";

import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/styled/LoaderSimple";
import { Toaster } from "./components/styled/solid-toast/src";
import { themeConfig } from "./cypher/get/themeConfig";
import { getGlobalThemeVertex } from "./lib/graph/get/sync/getGlobalThemeVertex";
import { GraphContext } from "./lib/graph/graph";

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const loadingSite = createSignal(false);
  const graph = createAppState();

  return (
    <Router
      root={(props) => {
        return (
          <CSSRuntimeProvider config={themeConfig(getGlobalThemeVertex(graph[0]))}>
            <GraphContext.Provider value={graph}>
              <MetaProvider>
                <Suspense fallback={<LoaderNew />}>
                  {/* <ErrorBoundary fallback={(error) => {
                        return <div>Something went wrong: {error.message}</div>;
                      }}> */}
                  {props.children}
                  {/* </ErrorBoundary> */}
                </Suspense>
                <Show fallback={<Toaster />} when={loadingSite[0]()}>
                  <div class="fixed flex ai:center bg:rgba(0,0,0,0.5) h:100% jc:center left:0 top:0 w:100% z:9999">
                    <Toaster />
                  </div>
                </Show>
              </MetaProvider>
            </GraphContext.Provider>
          </CSSRuntimeProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
