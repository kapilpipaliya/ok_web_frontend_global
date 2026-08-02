import type { RouteSectionProps } from "@solidjs/router";

import { HomeIconButton } from "~/components/styled/buttons/HomeIconButton";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { EmailConfirmationBanner } from "~/components/notifications/EmailConfirmationBanner";
import { AuthRequired } from "~/components/auth/AuthRequired";
export default function SystemLayoutRoute(props: Readonly<RouteSectionProps>) {
  return (
    <AuthRequired>
      <PermissionGuard>
        <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
          <HomeIconButton />
          <As
            as="div"
            css={`return \`._id {
  margin-left: auto;
  display: flex;
  gap: 4px;
}\`;`}
          >
            <UserDropdownMenuDisplay />
          </As>
        </As>
        <EmailConfirmationBanner />
        {props.children}
      </PermissionGuard>
    </AuthRequired>
  );
}
