import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal, Show, Suspense } from "solid-js";
import { Toaster } from "solid-toast";
import { LoadingContext } from "~/lib/contexts";
import { CSSRuntimeProvider } from "./pages/utils/CSSRuntimeProvider";
import { LoaderNew } from "./components/custom/LoaderSimple";
import { Config } from "@master/css";

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
                <Suspense fallback={<LoaderNew />}>{props.children}</Suspense>
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
