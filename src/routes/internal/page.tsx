import type { JSX } from "solid-js";

import { createFileRoute, Outlet } from "@tanstack/solid-router";

import { GetInitialData } from "~/GetInitialData";

export const Route = createFileRoute('/internal/page')({
  component: TemplateLayout,
})


function TemplateLayout() {
  return (
    <GetInitialData authenticate={false} dontRedirectToLogin={true}>
      <Outlet />
    </GetInitialData>
  );
}
