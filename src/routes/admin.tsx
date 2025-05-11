import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { GetInitialData } from "~/GetInitialData";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { EmailConfirmationBanner } from "~/components/notifications/EmailConfirmationBanner";
import { useGraph } from "~/lib/graph/context/UseGraph";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();

  return (
    <PermissionGuard>
      <GetInitialData authenticate>
        <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
        <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
          <HomeIcon />
          <As
            as="div"
            css={css`
  margin-left: auto;
  display: flex;
  gap: 4px;
`}
          >
            <UserDropdownMenuDisplay />
          </As>
        </As>
        <EmailConfirmationBanner />
        {props.children}
      </GetInitialData>
    </PermissionGuard>
  );
}
