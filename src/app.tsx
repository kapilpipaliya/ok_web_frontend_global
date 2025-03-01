import { MetaProvider } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { FileRoutes } from "@solidjs/start/router";
import { ToastProvider } from "solid-hot-toast";

import "~/base.css";

import { Show, Suspense } from "solid-js";

import { createAppState } from "~/createAppState";

import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/styled/LoaderSimple";
import { getGlobalThemeVertex } from "./lib/graph/get/sync/theme/getGlobalThemeVertex";
import { themeConfig } from "./lib/graph/get/sync/theme/themeConfig";
import { GraphContext } from "./lib/graph/graph";
import { toastValue } from "./toastValue";

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const graph = createAppState();
  const Toaster = clientOnly(() => import("./Toaster"));

  return (
    <ToastProvider {...toastValue}>
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
    </ToastProvider>
  );
}
