import { Title } from "@solidjs/meta";
import { For, Show } from "solid-js";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { Graph } from "~/lib/graph/graph";

export interface MenuItem {
  component: string;
  id: string;
  label: string;
  adminOnly?: boolean;
}

interface SettingsLayoutProps {
  title: string;
  description: string;
  menuItems: MenuItem[];
  selectedMenu: () => string;
  onMenuSelect: (id: string) => void;
  graph: Graph;
  children: any;
}

export function SettingsLayout(props: SettingsLayoutProps) {
  return (
    <div class="">
      <Title>
        {props.title} -{" "}
        {props.menuItems.find((item) => item.id === props.selectedMenu())?.label}
      </Title>

      <HeaderWithDescription
        class="flex:1"
        description={props.description}
        title={props.title}
      />

      <div class="display:grid grid-template-columns:250px|1fr border-right:1px|solid|#eee p:6">
        <div>
          <For each={props.menuItems}>
            {(item) => (
              <Show when={!item.adminOnly || isAdminRole(props.graph)}>
                <div
                  class={`p:12px cursor:pointer r:4px mb:8px ${
                    props.selectedMenu() === item.id
                      ? "bg:primary fg:base-5"
                      : "bg:primary-10:hover fg:#374151"
                  }`}
                  onClick={() => props.onMenuSelect(item.id)}
                >
                  {item.label}
                </div>
              </Show>
            )}
          </For>
        </div>
        <div class="flex:1 p:6">
          {props.children}
        </div>
      </div>
    </div>
  );
} 