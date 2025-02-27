import type { RouteSectionProps } from "@solidjs/router";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { GetInitialData } from "~/GetInitialData";
import { API } from "~/lib/api/endpoints";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [_graph] = useGraph();
  return (
    <GetInitialData authenticate>
      {/* <Link href={getCompanyLogoUrl(graph) || ""} rel="icon" /> */}
      <header class={SETTINGS_CONSTANTS.HEADER_MENU_CLASS}>
        <HomeIcon url={API.urls.admin.root} />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </header>
      {props.children}
    </GetInitialData>
  );
}
