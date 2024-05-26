import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal,  ErrorBoundary,  Match, Show, Suspense, Switch } from "solid-js";
import { Toaster } from "solid-toast";
import { LoadingContext } from "~/lib/contexts";
import { CSSRuntimeProvider } from "./pages/utils/CSSRuntimeProvider";
import { LoaderNew } from "./components/custom/LoaderSimple";
import { Config } from "@master/css";
import { defineConfig } from "@solidjs/start/config";
import NotFound401 from "./pages/not-found/401";

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
  return (
    <Router
      root={(props) => {
        return (
          <CSSRuntimeProvider config={config}>
            <LoadingContext.Provider value={loadingSite}>
              <MetaProvider>
                <div id="popup-root" />
                <Suspense fallback={<LoaderNew />}>
                  <ErrorBoundary fallback={(error) => {
                    
                    if (error.message === 'Not Authorized') {
                      return <NotFound401 />;
                    } else {
                      return <div>Something went wrong: {error.message}</div>;
                    }
                  }}>
                    {props.children}
                  </ErrorBoundary>
                </Suspense>

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
          </CSSRuntimeProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
