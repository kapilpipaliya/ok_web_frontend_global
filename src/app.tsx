import { Link, MetaProvider } from "@solidjs/meta";
import { Router, useLocation, useNavigate } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { FileRoutes } from "@solidjs/start/router";
import { ToastProvider } from "solid-hot-toast";
import { App as CapacitorApp } from "@capacitor/app";
import { makeTimer } from "@solid-primitives/timer";

// import "~/base.css";
import {
  ErrorBoundary,
  onMount,
  Suspense,
  createSignal,
  Show,
} from "solid-js";
import { isServer, NoHydration } from "solid-js/web";

import { createAppState } from "~/createAppState";
import { ThemeProvider } from "./lib/theme/ThemeProvider";
import { logError } from "./lib/error/errorLogger";
import { setupGlobalErrorHandlers } from "./lib/error/globalErrorHandler";
import { toastValue } from "./toastValue";
import { GraphContext } from "~/lib/graph/context/GraphContext";
import { GetInitialData } from "./GetInitialData";
import { HydrationLoader } from "./components/HydrationLoader";
import { NavigationProgressBar } from "./components/NavigationProgressBar";
import {
  isNetworkError,
  NETWORK_ERROR_MESSAGE,
} from "~/lib/api/withNetworkRetry";
import { API } from "~/lib/api/endpoints";

/** Above VertexPickerModal (101) and other app overlays so toasts stay visible. */
const TOAST_CONTAINER_Z_INDEX = 20000;
/** Only show the blur overlay if JS has not reached onMount within this window. */
const HYDRATION_LOADER_DELAY_MS = 250;

// Create a generic error fallback component
const ErrorFallback = (props: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  console.error(props.error);
  const message = isNetworkError(props.error)
    ? NETWORK_ERROR_MESSAGE
    : props.error.message;
  return (
    <div class="error-boundary-fallback">
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <button onClick={props.resetErrorBoundary}>Try again</button>
    </div>
  );
};

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const graph = createAppState();
  const [isHydrated, setIsHydrated] = createSignal(false);
  // Never SSR a full-screen blur (starts false).
  const [showLoader, setShowLoader] = createSignal(true);
  const Toaster = clientOnly(() => import("./Toaster"));

  // Show blur only if hydration is slow; onMount cancels before it fires on fast loads.
  const cancelHydrationLoader = makeTimer(
    () => setShowLoader(false),
    HYDRATION_LOADER_DELAY_MS,
    setTimeout,
  );

  onMount(() => {
    if (isServer) return;
    setupGlobalErrorHandlers();
    cancelHydrationLoader?.();
    // Set isHydrated to true after a short delay to ensure components are ready
    makeTimer(() => setIsHydrated(true), 100, setTimeout);
  });

  return (
    <ToastProvider {...toastValue}>
      <GraphContext.Provider value={graph}>
        <Router
          root={(props) => {
            const location = useLocation();
            const navigate = useNavigate();

            // Set up Capacitor deep linking listener
            onMount(() => {
              if (isServer) return;

              const handleDeepLink = (
                urlString: string,
                useTimeout = false,
              ) => {
                try {
                  const url = new URL(urlString);
                  const path = url.pathname + url.search + url.hash;

                  // API routes need full page reload, client routes use SPA navigation
                  if (path.startsWith("/api/")) {
                    window.location.href = path;
                  } else if (useTimeout) {
                    makeTimer(() => navigate(path), 100, setTimeout);
                  } else {
                    navigate(path);
                  }
                } catch (err) {
                  console.error("[Deep Link] Error:", err, "URL:", urlString);
                }
              };

              // Handle cold start (app was closed when link clicked)
              CapacitorApp.getLaunchUrl()
                .then(
                  (result) => result?.url && handleDeepLink(result.url, true),
                )
                .catch((err) =>
                  console.error("[Deep Link] Launch URL error:", err),
                );

              // Handle warm start (app was running when link clicked)
              CapacitorApp.addListener("appUrlOpen", (data) => {
                if (data.url) handleDeepLink(data.url);
              });
            });

            return (
              <MetaProvider>
                <Link href={API.file.downloadCompanyFaviconUrl} rel="icon" />
                <ErrorBoundary
                  fallback={(error, reset) => {
                    // Log the UI error
                    if (!isServer) {
                      logError(error, { location: location.pathname });
                    }
                    return (
                      <ErrorFallback error={error} resetErrorBoundary={reset} />
                    );
                  }}
                >
                  <Suspense>
                    <GetInitialData dontRedirectToLogin={true}>
                      <ThemeProvider>
                        <Suspense>{props.children}</Suspense>
                      </ThemeProvider>
                    </GetInitialData>
                  </Suspense>
                  <Show when={isHydrated()}>
                    {/* <Show when={!location.pathname.startsWith("/email-templates")}> */}
                    <Toaster
                      containerStyle={{
                        "z-index": String(TOAST_CONTAINER_Z_INDEX),
                      }}
                    />
                    {/* </Show> */}
                  </Show>
                  <NoHydration>
                    <NavigationProgressBar />
                    <HydrationLoader show={showLoader()} />
                  </NoHydration>
                </ErrorBoundary>
              </MetaProvider>
            );
          }}
        >
          <FileRoutes />
        </Router>
      </GraphContext.Provider>
    </ToastProvider>
  );
}
