

import type { ParentProps } from "solid-js";

import { Link } from "@solidjs/meta";
import { createFileRoute, Outlet } from "@tanstack/solid-router";

import { GetInitialData } from "~/GetInitialData";
import { getCompanyCircularLogoUrl } from "~/lib/graph/get/sync/company/getCompanyCircularLogoUrl";
import { useGraph } from "~/lib/graph/graph";

export const Route = createFileRoute('/admin/_noLayout/$entity/$id')({
   component: AdminLayoutRoute,
})

function AdminLayoutRoute(props: ParentProps) {
  const [graph] = useGraph();
  return (
    <GetInitialData authenticate>
      <Link href={getCompanyCircularLogoUrl(graph) || ""} rel="icon" />
      <Outlet />
    </GetInitialData>
  );
}
