import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { FileRoutes } from "@solidjs/start/router";
import { ToastProvider } from "solid-hot-toast";

// import "~/base.css";
import { ErrorBoundary, onMount, Suspense, createSignal, Show } from "solid-js";
import { isServer } from "solid-js/web";

import { createAppState } from "~/createAppState";
import { ThemeProvider } from "./lib/context/ThemeProvider";

import { LoaderNew } from "./components/styled/LoaderSimple";
import { logError } from "./lib/error/errorLogger";
import { setupGlobalErrorHandlers } from "./lib/error/globalErrorHandler";
import { GraphContext } from "./lib/graph/GraphContext";
import { toastValue } from "./toastValue";

// Create a generic error fallback component
const ErrorFallback = (props: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  console.error(props.error);
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
  const [isHydrated, setIsHydrated] = createSignal(false);
  const Toaster = clientOnly(() => import("./Toaster"));

  // Set up global error handlers on client-side only
  onMount(() => {
    if (!isServer) {
      setupGlobalErrorHandlers();
      // Set isHydrated to true after a short delay to ensure components are ready
      setTimeout(() => {
        setIsHydrated(true);
      }, 3000);
    }
  });

  return (
    <ToastProvider {...toastValue}>
      <Router
        root={(props) => {
          // <A> and 'use' router primitives can be only used inside a Route.
          // const location = useLocation();
          return (
            <MetaProvider>
              <GraphContext.Provider value={graph}>
                <ThemeProvider>
                  <ErrorBoundary
                    fallback={(error, reset) => {
                      // Log the UI error
                      if (!isServer) {
                        logError(error, { location: location.pathname });
                      }
                      return (
                        <ErrorFallback
                          error={error}
                          resetErrorBoundary={reset}
                        />
                      );
                    }}
                  >
                    <Suspense fallback={<LoaderNew />}>
                      {props.children}
                    </Suspense>
                  </ErrorBoundary>
                  <Show when={isHydrated()}>
                    {/* <Show when={!location.pathname.startsWith("/email-templates")}> */}
                    <Toaster />
                    {/* </Show> */}
                  </Show>
                </ThemeProvider>
              </GraphContext.Provider>
            </MetaProvider>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </ToastProvider>
  );
}
