import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { GetInitialData } from "~/GetInitialData";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { useGraph } from "~/lib/graph/GraphContext";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export default function SystemLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <GetInitialData authenticate>
      <PermissionGuard>
        <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
        <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
          <HomeIcon />
          <As as="div" css={css`
  margin-left: auto;
  display: flex;
  gap: 4px;
`}>
            <UserDropdownMenuDisplay />
          </As>
        </As>
        {props.children}
      </PermissionGuard>
    </GetInitialData>
  );
}
