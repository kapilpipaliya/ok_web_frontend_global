
import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { ParentProps } from "solid-js";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { GetInitialData } from "~/GetInitialData";
import { API } from "~/lib/api/endpoints";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export const Route = createFileRoute('/admin/_layout2')({
  component: AdminLayoutRoute,
})

function AdminLayoutRoute(props: ParentProps) {
  return (
    <GetInitialData authenticate>
      {/* <Link href={getCompanyLogoUrl(graph) || ""} rel="icon" /> */}
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
