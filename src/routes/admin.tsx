import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";
import { createMemo } from "solid-js";

import { HomeIconButton } from "~/components/styled/buttons/HomeIconButton";
import { RedirectUrlIconButton } from "~/components/styled/buttons/RedirectUrlIconButton";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { EmailConfirmationBanner } from "~/components/notifications/EmailConfirmationBanner";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { AuthRequired } from "~/components/auth/AuthRequired";
import { StyleRenderer } from "~/components/StyleRenderer";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { processCssContent } from "~/lib/styles/processCss";
import { useTheme } from "~/lib/theme/ThemeContext";
import { AdminPwa } from "~/lib/pwa/AdminPwa";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  const theme = useTheme();

  const adminGlobalCss = createMemo(() => {
    const functionArgs = {
      theme,
    } as FunctionArgumentType;

    return processCssContent(
      `return \`body {
        background-color: \${t.var.color?.background};
        color: \${t.var.color?.text};
      }\`;`,
      functionArgs,
      "admin-global",
    );
  });

  return (
    <PermissionGuard>
      <StyleRenderer cssContent={adminGlobalCss()} id="admin-global-styles" />
      <AuthRequired>
        <AdminPwa />
        <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
        <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
          <HomeIconButton />
          <RedirectUrlIconButton />
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
      </AuthRequired>
    </PermissionGuard>
  );
}
