import { createRootRoute, Outlet } from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { CSSRuntimeProvider } from "~/components/CSSRuntimeProvider";
import { createAppState } from "~/createAppState";
import { getGlobalThemeVertex } from "~/lib/graph/get/sync/theme/getGlobalThemeVertex";
import { themeConfig } from "~/lib/graph/get/sync/theme/themeConfig";

export const Route = createRootRoute({
  component: RootComponent
});

function RootComponent() {
    const graph = createAppState();
  return (
    <Suspense>
        {/* <CSSRuntimeProvider
          config={themeConfig(getGlobalThemeVertex(graph[0]))}
        > */}
        <Outlet />
    {/* </CSSRuntimeProvider> */}
      </Suspense>
  );
}
