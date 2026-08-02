import type { JSX } from "solid-js";

import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import AdminDashboard from "~/pages/admin_dashboard/Dashboard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { EmailConfirmationBanner } from "~/components/notifications/EmailConfirmationBanner";
import { AuthRequired } from "~/components/auth/AuthRequired";
import { RedirectUrlIconButton } from "~/components/styled/buttons/RedirectUrlIconButton";
import { useTheme } from "~/lib/theme/ThemeContext";
import { createMemo } from "solid-js";
import { processCssContent } from "~/lib/styles/processCss";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { StyleRenderer } from "~/components/StyleRenderer";
import { AdminPwa } from "~/lib/pwa/AdminPwa";

export default function Admin() {
  return (
    <AdminLayoutRoute>
      <AdminDashboard />
    </AdminLayoutRoute>
  );
}

function AdminLayoutRoute(props: { children: JSX.Element }) {
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
        <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
          <RedirectUrlIconButton />
          <As
            as="div"
            css={`return \`._id {
  flex: 1;
}\`;`}
          />
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
