import { MetaProvider } from "@solidjs/meta";
import { A, Route, Router, useMatch, useParams } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Component, createSignal, Show, Suspense } from "solid-js";
import { Toaster } from "solid-toast";
import { config } from "~/master.css";
import { LoadingContext } from "~/lib/global";
import { CSSRuntimeProvider } from "./components/layout/CSSRuntimeProvider";
import { LoaderNew } from "./components/custom/LoaderSimple";

export default function App() {
  const loadingSite = createSignal(false);
  return (
    <Router
      root={(props) => {
        return (
          <CSSRuntimeProvider config={config}>
            <LoadingContext.Provider value={loadingSite}>
              <MetaProvider>
                <div id="popup-root" />
                <Suspense>
                  {props.children}
                  <Show when={loadingSite[0]()}>
                    <LoaderNew />
                  </Show>
                </Suspense>
                <Toaster />
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
