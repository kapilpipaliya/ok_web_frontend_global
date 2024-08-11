import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal, Show, Suspense } from "solid-js";

import "~/base.css";
import { configureState } from "~/configureState";
import { Sidebar } from "~/pages/admin_layout/sidebar/SidebarLayout";

import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/LoaderSimple";
import { Toaster } from "./components/solid-toast/src";
import { GraphContext } from "./lib/graph/graph";

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const loadingSite = createSignal(false);
  const graph = configureState();

  return (
    <Router
      root={(props) => {
        return (
          <CSSRuntimeProvider config={graph[0].globalTheme.P}>
            <GraphContext.Provider value={graph}>
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
            </GraphContext.Provider>
          </CSSRuntimeProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
