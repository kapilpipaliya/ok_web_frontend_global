import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { SubDomainGrid } from "~/pages/subdomain/SubDomainGrid";

export default function Projects() {
  return (
    <div class="display:grid grid-template-rows:auto|1fr h:100vh">
      <div class="display:flex">
        <HeaderWithDescription
          class="flex:1"
          description="Manage your projects"
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