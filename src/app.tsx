import { MetaProvider } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";
import { RouterProvider } from "@tanstack/solid-router";

import "~/base.css";

import { ToastProvider } from "solid-hot-toast";
import { ErrorBoundary, onMount, Suspense } from "solid-js";
import { isServer } from "solid-js/web";

import { createAppState } from "~/createAppState";

import { CSSRuntimeProvider } from "./components/CSSRuntimeProvider";
import { LoaderNew } from "./components/styled/LoaderSimple";
import { logError } from "./lib/error/errorLogger";
import { setupGlobalErrorHandlers } from "./lib/error/globalErrorHandler";
import { getGlobalThemeVertex } from "./lib/graph/get/sync/theme/getGlobalThemeVertex";
import { themeConfig } from "./lib/graph/get/sync/theme/themeConfig";
import { GraphContext } from "./lib/graph/graph";
import { router } from "./router";
import { toastValue } from "./toastValue";


// Create a generic error fallback component
const ErrorFallback = (props: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  console.error(props.error)
  return (
    <div class="error-boundary-fallback">
      <h2>Something went wrong</h2>
      <p>{props.error.message}</p>
      <button onClick={props.resetErrorBoundary}>Try again</button>
    </div>
  );
};

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const graph = createAppState();
  const Toaster = clientOnly(() => import("./Toaster"));

  // Set up global error handlers on client-side only
  onMount(() => {
    if (!isServer) {
      setupGlobalErrorHandlers();
    }
  });
  const CSSRuntimeProvider = clientOnly(() => import("./components/CSSRuntimeProvider"));

  return (
    <ToastProvider {...toastValue}>
          
            <GraphContext.Provider value={graph}>
              <CSSRuntimeProvider
                config={themeConfig(getGlobalThemeVertex(graph[0]))}
              >
                <MetaProvider>
                  <ErrorBoundary
                    fallback={(error, reset) => {
                      // Log the UI error
                      logError(error, { location: location.pathname });
                      return (
                        <ErrorFallback
                          error={error}
                          resetErrorBoundary={reset}
                        />
                      );
                    }}
                  >
                    <RouterProvider router={router} />
                  </ErrorBoundary>
                  {/* <Show when={!location.pathname.startsWith("/email-templates")}> */}
                  <Toaster />
                  {/* <CSSRuntimeProvider
                config={themeConfig(getGlobalThemeVertex(graph[0]))}
              />    */}
                  {/* </Show> */}
                </MetaProvider>
              </CSSRuntimeProvider>
            </GraphContext.Provider>

        
    </ToastProvider>
  );
}
