import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { GetInitialData } from "~/GetInitialData";
import { getCompanyLogoUrl } from "~/lib/graph/get/sync/getCompanyLogoUrl";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { SystemLayout } from "~/pages/SystemLayout";

export default function SystemLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <GetInitialData authenticate>
      <Link href={getCompanyLogoUrl(graph) || ""} rel="icon" />
      <header class={SETTINGS_CONSTANTS.HEADER_MENU_CLASS}>
        <HomeIcon url="/system/projects" />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </header>
      <SystemLayout>{props.children}</SystemLayout>
    </GetInitialData>
  );
}
