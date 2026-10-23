import { Title } from "@solidjs/meta";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { SubDomainGrid } from "~/pages/subdomain/SubDomainGrid";
import { As } from "~/components/As";
import type {  JSX  } from "@solidjs/web";
import { AuthRequired } from "~/components/auth/AuthRequired";
import { StyleRenderer } from "~/components/StyleRenderer";
import { useTheme } from "~/lib/theme/ThemeContext";
import { createMemo } from "solid-js";
import { processCssContent } from "~/lib/styles/processCss";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export default function Projects() {
  const theme = useTheme();

  const systemGlobalCss = createMemo(() => {
    const functionArgs = {
      theme,
    } as FunctionArgumentType;

    return processCssContent(
      `return \`body {
        background-color: \${t.var.color?.background};
        color: \${t.var.color?.text};
      }\`;`,
      functionArgs,
      "system-global",
    );
  });
  return (
    <SystemLayoutRoute>
      <Title>Projects</Title>
      <StyleRenderer cssContent={systemGlobalCss()} id="system-global-styles" />
      <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
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

      <HeaderWithDescription
        css={`return \`._id {
  flex: 1;
}\`;`}
        description={
          <>
            Each project has a separate subdomain and database. Only
            administrators (users with <b>Admin</b> role) can create and manage
            projects.
            <br />
            Click on Subdomain Name or Custom Domain Name to sign in to that
            project in a new tab.
          </>
        }
        title="Projects"
      />

      <As
        as="div"
        css={`return \`._id {
  padding: 6px;
}\`;`}
      >
        <SubDomainGrid />
      </As>
    </SystemLayoutRoute>
  );
}

function SystemLayoutRoute(props: { children: JSX.Element }) {
  return <AuthRequired>{props.children}</AuthRequired>;
}
