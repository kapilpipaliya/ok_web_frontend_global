import type { JSX } from "solid-js";

import { Link } from "@solidjs/meta";

import { GetInitialData } from "~/GetInitialData";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { useGraph } from "~/lib/graph/GraphContext";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import AdminDashboard from "~/pages/admin_dashboard/Dashboard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { EmailConfirmationBanner } from "~/components/notifications/EmailConfirmationBanner";

export default function Admin() {
  return (
    <AdminLayoutRoute>
      <AdminDashboard />
    </AdminLayoutRoute>
  );
}

function AdminLayoutRoute(props: { children: JSX.Element }) {
  const [graph] = useGraph();
  return (
    <PermissionGuard>
      <GetInitialData authenticate>
        <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
        <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
          <As
            as="div"
            css={css`
  flex: 1;
`}
          />
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
