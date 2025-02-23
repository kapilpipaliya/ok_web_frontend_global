import { Title } from "@solidjs/meta";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SubDomainGrid } from "~/pages/subdomain/SubDomainGrid";


export default function Projects() {
  return (
    <div class="">
      <Title>Projects</Title>
      <div class="display:flex">
        <HeaderWithDescription
          class="flex:1"
          description={
            <>
              Each project has a separate subdomain and database. Only administrator can create and manage projects.
              <br />
              Click on Subdomain Name or Custom Domain Name to login to that project.
            </>
          }
          title="Projects"
        />

        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </div>
      <div class="p:6">
        <SubDomainGrid />
      </div>
    </div>
  );
}
