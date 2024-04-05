import {Icon} from "@iconify-icon/solid";
import {Accordion} from "@kobalte/core";
import {useLocation, useNavigate} from "@solidjs/router";
import {For, Setter} from "solid-js";
import {navbarDataI} from "./Sidebar";

export default function SidebarElement(props: {
    navbarData: navbarDataI[];
    resetSearch: () => void;
    isSearchMode: boolean;
    openIds: string[];
    setOpenIds: Setter<string[]>;
}) {
    const location = useLocation();
    const navigate = useNavigate();

    const mainIcon = {
        '/admin/dashboards':'akar-icons:dashboard',
        '/admin/':'fluent:home-24-regular',
        '/admin/DataType':'carbon:data-1',
        '/admin/CompCategory':'material-symbols-light:settings-input-component-outline',
        '/admin/Comp':'iconoir:component',
        '/admin/SimpleImport':'uil:import',
        '/admin/backup_restore':'lucide:database-backup',
        '/admin/User':'ci:users',
        '/admin/Role':'eos-icons:role-binding-outlined',
        '/admin/Perm':'tabler:lock-access',
        '/admin/Coll':'ep:collection-tag',
        '/admin/CollCategory':'ic:outline-collections-bookmark',
        '/admin/Page':'iconoir:multiple-pages',
        '/admin/Dashboard':'mage:dashboard-2',
    }

    return (
      <div>
        
        <Accordion.Root
          multiple
          class="overflow-x:hidden overflow-y:auto user-select:none r:5|5|5|5"
          value={props.openIds}
          onChange={props.setOpenIds}
        >
          <For
            each={props.navbarData ?? []}
            fallback={
              <div class="flex ai:center jc:center mt:10">No data found</div>
            }
          >

            {(item) => {
              return (
                <li
                  style={{ transition: "all .2s ease-in-out" }}
                  class={`cursor:pointer r:5 mr:2 ${
                    location.pathname.toLowerCase() === item.href.toLowerCase()
                      ? "bg:#3477CC fg:white"
                      : ""
                  }`}
                >
                  {item.expanded === undefined ? (
                    <div
                      class="flex ai:center p:8 r:5|5|5|5 bg:#CDDDF3:hover fg:black:hover"
                      onclick={() => {
                        navigate(item.href, {
                          resolve: false,
                        });
                        props.resetSearch();
                      }}
                    >
                        <Icon icon={mainIcon[item.href]} height={20}/>&nbsp;&nbsp;
                        <span class="font:14 font-weight:medium">{item.name}</span>
                    </div>
                  ) : (
                    <Accordion.Item value={item.id}>
                      <Accordion.Trigger class="w:full">
                        <Accordion.Header class="w:full flex r:5|5|5|5 p:1 ai:center jc:left px:10 py:0 bg:#CDDDF3:hover">
                          <div class="pr-4 font:15">
                            <Icon
                              icon={"mdi:chevron-up"}
                              aria-hidden
                              class={`${
                                !props.openIds.includes(item.id)
                                  ? "rotate-bottom"
                                  : "rotate-top"
                              } flex-1`}
                              style="font-size: 24px; border-radius: 50%; margin-left: 5px; margin-top:7px"
                            />
                          </div>
                          <div class="ml:8 font:14 py:8">
<span>{item.name}</span>
                          </div>
                        </Accordion.Header>
                      </Accordion.Trigger>
                      <Accordion.Content class="pl:20">
                        <SidebarElement
                          openIds={props.openIds}
                          setOpenIds={props.setOpenIds}
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
