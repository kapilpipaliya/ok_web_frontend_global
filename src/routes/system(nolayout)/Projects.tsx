import { Link, Title } from "@solidjs/meta";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { GetInitialData } from "~/GetInitialData";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { SubDomainGrid } from "~/pages/subdomain/SubDomainGrid";

export default function Projects() {
  return (
    <SystemLayoutRoute>
      <Title>Projects</Title>
      <header class={SETTINGS_CONSTANTS.HEADER_MENU_CLASS}>
        <div class="flex:1" />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </header>

      <HeaderWithDescription
        class="flex:1"
        description={
          <>
            Each project has a separate subdomain and database. Only
            administrators (users with <b>Admin</b> role) can create and manage
            projects.
            <br />
            Click on Subdomain Name or Custom Domain Name to login to that
            project in new tab.
          </>
        }
        title="Projects"
      />

      <div class="p:6">
        <SubDomainGrid />
      </div>
    </SystemLayoutRoute>
  );
}

function SystemLayoutRoute(props: { children: JSX.Element }) {
  const [graph] = useGraph();
  return (
    <GetInitialData authenticate>
      <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
      {props.children}
    </GetInitialData>
  );
}
