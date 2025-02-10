import { createSignal, For, Show } from "solid-js";

import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { useGraph } from "~/lib/graph/graph";
import { TemplateGraphProvider } from "~/pages/TemplateGraphProvider";
import { TemplateRenderer } from "~/pages/TemplateRenderer";

export default function Settings() {
  return (
    <TemplateGraphProvider>
      <SettingsContent />
    </TemplateGraphProvider>
  );
}

function SettingsContent() {
  const [graph] = useGraph();
  const [selectedMenu, setSelectedMenu] = createSignal("profile");
  
  const isAdmin = () => getGlobalStore(graph).P.userRoles.includes("admin");

  const menuItems = [
    {
      component: "ProfileSettings",
      id: "profile",
      label: "Profile"
    },
    {
      component: "PasswordSettings",
      id: "password", 
      label: "Change Password"
    },
    {
      adminOnly: true,
      component: "EmailSettings",
      id: "email",
      label: "Email Settings"
    }
  ];

  return (
    <div class="display:flex h:100vh">
      <div class="w:250px border-right:1px|solid|#eee p:20px">
        <For each={menuItems}>
          {(item) => (
            <Show when={!item.adminOnly || isAdmin()}>
              <div
                class={`p:12px cursor:pointer r:4px mb:8px ${
                  selectedMenu() === item.id 
                    ? "bg:secondary fg:white" 
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

      <div class="flex:1 p:20px">
        <TemplateRenderer 
          name={menuItems.find(i => i.id === selectedMenu())?.component || ""}
        />
      </div>
    </div>
  );
}
