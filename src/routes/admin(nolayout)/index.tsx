import type { JSX } from "solid-js";

import { Link } from "@solidjs/meta";

import { GetInitialData } from "~/GetInitialData";
import { getCompanyCircularLogoUrl } from "~/lib/graph/get/sync/company/getCompanyCircularLogoUrl";
import { useGraph } from "~/lib/graph/graph";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import AdminDashboard from "~/pages/admin_dashboard/Dashboard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

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
        <Link href={getCompanyCircularLogoUrl(graph) || ""} rel="icon" />
        <header class={SETTINGS_CONSTANTS.HEADER_MENU_CLASS}>
          <div class="flex:1" />
          <div class="ml:auto flex gap:4">
            <UserDropdownMenuDisplay />
          </div>
        </header>
        {props.children}
      </GetInitialData>
    </PermissionGuard>
  );
}
