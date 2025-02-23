import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { EmailSettings } from "~/pages/global/email/EmailSettings";

export default function GlobalSettings() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(
    searchParams.tab || "email",
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab && tab !== selectedMenu()) {
      setSelectedMenu(tab);
    }
  });

  const menuItems = [
    {
      component: "EmailSettings",
      id: "email",
      label: "Email Settings",
    },
  ];

  const handleMenuSelect = (id: string) => {
    setSelectedMenu(id);
    setSearchParams({ tab: id });
  };

  return (
    <div class="display:grid grid-template-rows:auto|1fr h:100vh">
      <Title>Global Settings - {menuItems.find(item => item.id === selectedMenu())?.label}</Title>
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
                  class={`p:12px cursor:pointer r:4px mb:8px ${
                    selectedMenu() === item.id
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
          <Show when={selectedMenu() === "email"}>
            <EmailSettings />
          </Show>
        </div>
      </div>
    </div>
  );
}
