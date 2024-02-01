import { Icon } from "@iconify-icon/solid";
import { Accordion } from "@kobalte/core";
import { useLocation, useNavigate } from "@solidjs/router";
import { For, createEffect, createSignal, untrack } from "solid-js";
import treeViewFilter from "../lib/treeViewFilter";
import { navbarDataI } from "./Sidebar";

function getIds(data: navbarDataI[], ids: string[] = []) {
  data.forEach((e) => {
    if (e.expanded !== undefined) ids.push(e.id);
    getIds(e.children, ids);
  });
  return ids;
}

export default function SidebarElement(props: {
  navbarData: navbarDataI[];
  resetSearch: () => void;
  isSearchMode: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openIds, setOpenIds] = createSignal<string[]>([]);

  createEffect(() => {
    const navData = props.navbarData;
    if (navData.length === 0) return;

    const loadPath = untrack(() => location.pathname);
    const result: navbarDataI[] = untrack(() => treeViewFilter(navData, (node: navbarDataI) => node.href === loadPath));

    setOpenIds(getIds(result));
  });

  createEffect(() => {
    if (props.isSearchMode) {
      const ids = props.navbarData
        .map((e) => {
          if (e.expanded !== undefined) return e.id;
          return null;
        })
        .filter((e) => e) as string[];
      setOpenIds(ids);
    }
  });

  return (
    <div>
      <Accordion.Root
        multiple
        class="overflow-x:hidden overflow-y:auto user-select:none"
        value={openIds()}
        onChange={setOpenIds}
      >
        <For each={props.navbarData ?? []} fallback={<div>Loading...</div>}>
          {(item) => {
            return (
              <li
                class={`cursor:pointer ${
                  location.pathname.toLowerCase() === item.href.toLowerCase() ? "bg:#337ab7 fg:white" : ""
                }`}
              >
                {item.expanded === undefined ? (
                  <div
                    class="flex ai:center p:8 bg:#b2b2b2:hover fg:black:hover"
                    onclick={() => {
                      navigate(item.href, {
                        resolve: false,
                      });
                      props.resetSearch();
                    }}
                  >
                    <span class="font:14">{item.name}</span>
                  </div>
                ) : (
                  <Accordion.Item value={item.id} data-expanded>
                    <Accordion.Trigger class="w:full">
                      <Accordion.Header class="w:full flex ai:center jc:left px:10 bg:#b2b2b2:hover">
                        <div class="pr-4 font:15">
                          <Icon icon="mingcute:down-fill" aria-hidden />
                        </div>
                        <div class="ml:8 font:14 py:8">
                          <span>{item.name}</span>
                        </div>
                      </Accordion.Header>
                    </Accordion.Trigger>
                    <Accordion.Content class="pl:20">
                      <SidebarElement
                        resetSearch={props.resetSearch}
                        navbarData={item.children}
                        isSearchMode={props.isSearchMode}
                      />
                    </Accordion.Content>
                  </Accordion.Item>
                )}
              </li>
            );
          }}
        </For>
      </Accordion.Root>
    </div>
  );
}
