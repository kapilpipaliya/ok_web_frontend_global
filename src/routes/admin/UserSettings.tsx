import { createSignal, For, Show } from "solid-js";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SubDomainSettings } from "~/pages/subdomain/SubDomainSettings";

import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { PasswordChangeForm } from "~/pages/user/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/ProfileSettings";


export default function UserSettings() {
  const [graph] = useGraph();
  const [selectedMenu, setSelectedMenu] = createSignal("profile");

  const menuItems = [
    {
      component: "ProfileSettings",
      id: "profile",
      label: "Profile",
    },
    {
      component: "PasswordSettings",
      id: "password",
      label: "Change Password",
    },
    {
      adminOnly: true,
      component: "SubDomainSettings",
      id: "subdomain",
      label: "Projects",
    },
  ];

  return (
    <div class="display:grid grid-template-rows:auto|1fr h:100vh">
      <div class="display:flex">
        <HeaderWithDescription
          class="flex:1"
          description="Manage your account settings and preferences."
          title="Account Settings"
        />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </div>

      <div class="display:grid grid-template-columns:250px|1fr border-right:1px|solid|#eee p:6">
        <div>
          <For each={menuItems}>
            {(item) => (
              <Show when={!item.adminOnly || isAdminRole(graph)}>
                <div
                  class={`p:12px cursor:pointer r:4px mb:8px ${
                    selectedMenu() === item.id
                      ? "bg:secondary fg:base-5"
                      : "bg:#f3f4f6:hover fg:#374151"
                  }`}
                  onClick={() => setSelectedMenu(item.id)}
                >
                  {item.label}
                </div>
              </Show>
            )}
          </For>
        </div>
        <div class="flex:1 p:6">
          <Show when={selectedMenu() === "profile"}>
            <ProfileSettings />
          </Show>
          <Show when={selectedMenu() === "password"}>
            <PasswordSettings />
          </Show>
          <Show when={selectedMenu() === "subdomain"}>
            <SubDomainSettings />
          </Show>
        </div>
      </div>
    </div>
  );
}

function PasswordSettings() {
  return (
    <div>
        <PasswordChangeForm />
    </div>
  );
}
