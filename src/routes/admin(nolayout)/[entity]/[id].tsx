import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";

import { useGraph } from "~/lib/graph/context/UseGraph";
import { AuthRequired } from "~/components/auth/AuthRequired";
import { useTheme } from "~/lib/theme/ThemeContext";
import { createMemo } from "solid-js";
import { processCssContent } from "~/lib/styles/processCss";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { StyleRenderer } from "~/components/StyleRenderer";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  const theme = useTheme();

  const adminGlobalCss = createMemo(() => {
    const functionArgs = {
      theme,
    } as FunctionArgumentType;

    return processCssContent(
      `return \`body {
        background-color: \${args.theme.var.color?.background};
        color: \${args.theme.var.color?.text};
      }\`;`,
      functionArgs,
      "admin-global",
    );
  });

  return (
    <AuthRequired>
      <StyleRenderer cssContent={adminGlobalCss()} id="admin-global-styles" />
      <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
      {props.children}
    </AuthRequired>
  );
}
