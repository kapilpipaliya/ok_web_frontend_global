import { MetaProvider } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

import "~/base.css";
import { Show, Suspense } from "solid-js";

import { createAppState } from "~/createAppState";

import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/styled/LoaderSimple";
import { Toaster } from "./components/styled/solid-toast/src";
import { themeConfig } from "./cypher/get/themeConfig";
import { getGlobalThemeVertex } from "./lib/graph/get/sync/getGlobalThemeVertex";
import { GraphContext } from "./lib/graph/graph";

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const graph = createAppState();

  return (
    <Router
      root={(props) => {
        const location = useLocation();
        return (
          <GraphContext.Provider value={graph}>
            <CSSRuntimeProvider
              config={themeConfig(getGlobalThemeVertex(graph[0]))}
            >
              <MetaProvider>
                <Suspense fallback={<LoaderNew />}>
                  {/* <ErrorBoundary fallback={(error) => {
                        return <div>Something went wrong: {error.message}</div>;
                      }}> */}
                  {props.children}
                  {/* </ErrorBoundary> */}
                </Suspense>
                <Show when={!location.pathname.startsWith("/email-templates")}>
                  <Toaster />
                </Show>
              </MetaProvider>
            </CSSRuntimeProvider>
          </GraphContext.Provider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
