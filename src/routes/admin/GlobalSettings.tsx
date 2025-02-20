import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { CompanySettings } from "~/pages/global/company/CompanySettings";
import { EmailSettings } from "~/pages/global/email/EmailSettings";
import { GeneralSettings } from "~/pages/global/general/GeneralSettings";
import { PermissionsSettings } from "~/pages/global/permission/PermissionsSettings";
import { RoleSettings } from "~/pages/global/role/RoleSettings";
import { UserManagement } from "~/pages/global/user/UserManagement";

import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";

export default function GlobalSettings() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(searchParams.tab || "general");

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab && tab !== selectedMenu()) {
      setSelectedMenu(tab);
    }
  });

  const menuItems = [
    {
      component: "GeneralSettings",
      id: "general", 
      label: "General"
    },
    {
      component: "CompanySettings",
      id: "company",
      label: "Company Details"
    },
    {
      component: "EmailSettings", 
      id: "email",
      label: "Email Settings"
    },
    {
      component: "ThemeSettings",
      id: "theme",
      label: "Theme Settings"
    },
    {
      component: "Permissions",
      id: "permissions",
      label: "Permissions"
    },
    {
      component: "RoleSettings",
      id: "roles",
      label: "Roles"
    },
    {
      component: "UserManagement",
      id: "users",
      label: "Users"
    }
  ];

  const handleMenuSelect = (id: string) => {
    setSelectedMenu(id);
    setSearchParams({ tab: id });
  };

  return (
    <div class="display:grid grid-template-rows:auto|1fr h:100vh">
      <div class="display:flex">
        <HeaderWithDescription
          class="flex:1"
          description="Manage global application settings"
          title="Global Settings"
        />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </div>

      <div class="display:grid grid-template-columns:250px|1fr border-right:1px|solid|#eee p:6">
        <div>
          <For each={menuItems}>
            {(item) => (
              <Show when={isAdminRole(graph)}>
                <div
                  class={`p:12px cursor:pointer r:4px mb:8px`}
                  classList={{
                    "bg:#f3f4f6:hover fg:#374151": selectedMenu() !== item.id,
                    "bg:secondary fg:base-5": selectedMenu() === item.id,
                  }}
                  onClick={() => handleMenuSelect(item.id)}
                >
                  {item.label}
                </div>
              </Show>
            )}
          </For>
        </div>
        <div class="flex:1 p:6">
          <Show when={selectedMenu() === "general"}>
            <GeneralSettings />
          </Show>
          <Show when={selectedMenu() === "company"}>
            <CompanySettings />
          </Show>
          <Show when={selectedMenu() === "email"}>
            <EmailSettings />
          </Show>
          <Show when={selectedMenu() === "theme"}>
            <ThemeSettings />
          </Show>
          <Show when={selectedMenu() === "permissions"}>
            <PermissionsSettings />
          </Show>
          <Show when={selectedMenu() === "roles"}>
            <RoleSettings />
          </Show>
          <Show when={selectedMenu() === "users"}>
            <UserManagement />
          </Show>
        </div>
      </div>
    </div>
  );
}

function ThemeSettings() {
  return <div>Theme Settings</div>;
}
