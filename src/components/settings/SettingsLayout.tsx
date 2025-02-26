import { Title } from "@solidjs/meta";
import { For, Show } from "solid-js";

import type { Graph } from "~/lib/graph/graph";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { STYLES } from "~/pages/settings/constants";

export interface MenuItem {
  adminOnly?: boolean;
  component: string;
  group?: string;
  id: string;
  label: string;
}

interface SettingsLayoutProps {
  children: any;
  description: string;
  graph: Graph;
  menuItems: MenuItem[];
  onMenuSelect: (id: string) => void;
  selectedMenu: () => string;
  title: string;
}

export function SettingsLayout(props: SettingsLayoutProps) {
  const groupedMenuItems = () => {
    const groups: Record<string, MenuItem[]> = {};
    props.menuItems.forEach((item) => {
      const group = item.group || 'default';
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  };

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

      <div class="display:grid grid-template-columns:250px|1fr  p:6">
        <div class={`${STYLES.overflow} h:calc(100vh-140px) border-right:1px|solid|#eee`}>
          <For each={Object.entries(groupedMenuItems())}>
            {([group, items]) => (
              <Show when={items.some(item => !item.adminOnly || isAdminRole(props.graph))}>
                <div class="mb:16px">
                  <Show when={group !== 'default'}>
                    <div class="text:14px fg:#6B7280 font-weight:500 mb:8px">{group}</div>
                  </Show>
                  <For each={items}>
                    {(item) => (
                      <Show when={!item.adminOnly || isAdminRole(props.graph)}>
                        <div
                          class={`p:12px cursor:pointer r:4px mb:8px ${
                            props.selectedMenu() === item.id
                              ? "bg:primary fg:base-5"
                              : "bg:primary-10:hover fg:base-90"
                          }`}
                          onClick={() => props.onMenuSelect(item.id)}
                        >
                          {item.label}
                        </div>
                      </Show>
                    )}
                  </For>
                </div>
              </Show>
            )}
          </For>
        </div>
        <div class="flex:1 p:6">{props.children}</div>
      </div>
    </div>
  );
}
