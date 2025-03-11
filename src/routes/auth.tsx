
import { Link } from "@solidjs/meta";
import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { ParentProps } from "solid-js";

import { GetInitialData } from "~/GetInitialData";
import { getCompanyCircularLogoUrl } from "~/lib/graph/get/sync/company/getCompanyCircularLogoUrl";
import { useGraph } from "~/lib/graph/graph";

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})

function AuthLayout(props: ParentProps) {
  const [graph] = useGraph();
  return (
    <>
      <Link href={getCompanyCircularLogoUrl(graph) || ""} rel="icon" />
      <GetInitialData authenticate={false} dontRedirectToLogin={true}>
        <Outlet />
      </GetInitialData>
    </>
  );
}
