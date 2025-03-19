import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { GetInitialData } from "~/GetInitialData";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { useGraph } from "~/lib/graph/GraphContext";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <PermissionGuard>
      <GetInitialData authenticate>
        <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
        <header class={SETTINGS_CONSTANTS.HEADER_MENU_CLASS}>
          <HomeIcon />
          <div class="ml:auto flex gap:4">
            <UserDropdownMenuDisplay />
          </div>
        </header>
        {props.children}
      </GetInitialData>
    </PermissionGuard>
  );
}
