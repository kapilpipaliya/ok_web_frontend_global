import type { RouteSectionProps } from "@solidjs/router";

import { AuthRequired } from "~/components/auth/AuthRequired";
import { useTheme } from "~/lib/theme/ThemeContext";
import { createMemo } from "solid-js";
import { processCssContent } from "~/lib/styles/processCss";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { StyleRenderer } from "~/components/StyleRenderer";
import { AdminPwa } from "~/lib/pwa/AdminPwa";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
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
    <AuthRequired>
      <StyleRenderer cssContent={adminGlobalCss()} id="admin-global-styles" />
      <AdminPwa />
      {props.children}
    </AuthRequired>
  );
}
