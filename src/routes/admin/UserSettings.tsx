import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { PasswordChangeForm } from "~/pages/user/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/ProfileSettings";

export default function UserSettings() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(
    searchParams.tab || "profile"
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab && tab !== selectedMenu()) {
      setSelectedMenu(tab);
    }
  });

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
  ];

  const handleMenuSelect = (id: string) => {
    setSelectedMenu(id);
    setSearchParams({ tab: id });
  };

  return (
    <div class="">
      <Title>Account Settings - {menuItems.find(item => item.id === selectedMenu())?.label}</Title>
      <HeaderWithDescription
        class=""
        description="Manage your account settings and preferences."
        title="Account Settings"
      />

      <div class="display:grid grid-template-columns:250px|1fr border-right:1px|solid|#eee p:6">
        <div>
          <For each={menuItems}>
            {(item) => (
              <Show when={!item.adminOnly || isAdminRole(graph)}>
                <div
                  class={`p:12px cursor:pointer r:4px mb:8px ${selectedMenu() === item.id
                      ? "bg:primary fg:base-5"
                      : "bg:primary-10:hover fg:#374151"
                    }`}
                  onClick={() => handleMenuSelect(item.id)}
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
            <PasswordChangeForm />
          </Show>
        </div>
      </div>
    </div>
  );
}

