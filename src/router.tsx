import { createRouter as createTanstackSolidRouter } from "@tanstack/solid-router";

import { GetInitialData } from "./GetInitialData";
import { PageViewWrapper } from "./pages/PageViewWrapper";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const router = createTanstackSolidRouter({
    defaultErrorComponent: err => <div>{err.error.stack}</div>,
    defaultNotFoundComponent: () => <Notfound />,
    defaultPreload: "intent",
    defaultStaleTime: 5000,
    routeTree,
    scrollRestoration: true
  });
  return router;
}

export const router = createRouter();

// Register things for typesafety
declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}


function Notfound() {
  return (
    <GetInitialData authenticate={true} dontRedirectToLogin={true}>
      <PageViewWrapper
        isNoPermissionCheck={true}
        pageKeyName={"404"}
        pageVertexName={"Page"}
      />
    </GetInitialData>
  );
}
