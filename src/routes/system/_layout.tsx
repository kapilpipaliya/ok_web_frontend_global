import { Link } from "@solidjs/meta";
import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { ParentProps } from "solid-js";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { GetInitialData } from "~/GetInitialData";
import { getCompanyCircularLogoUrl } from "~/lib/graph/get/sync/company/getCompanyCircularLogoUrl";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export const Route = createFileRoute('/system/_layout')({
  component: SystemLayoutRoute,
})

 function SystemLayoutRoute(props: ParentProps) {
  const [graph] = useGraph();
  return (
    <GetInitialData authenticate>
      <Link href={getCompanyCircularLogoUrl(graph) || ""} rel="icon" />
      <header class={SETTINGS_CONSTANTS.HEADER_MENU_CLASS}>
        <HomeIcon />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </header>
      <Outlet />
    </GetInitialData>
  );
}
