import { Icon } from "@iconify-icon/solid";
import { useLocation } from "@solidjs/router";
import { Show, For, Accessor, Resource, Setter } from "solid-js";
type MainSideBarProps = {
  activeSection: Accessor<string>;
  handleSearch: (input: string) => void;
  searchTerm: Accessor<string>;
  searchData: Accessor<any>;
  setSearchTerm: Setter<string>;
  expandedSections: Accessor<Map<string, boolean>>;
  toggleSection: (sectionName: string) => void;
  mainIcon: any;
  isCollapsed: Accessor<boolean>;
};
export const SubSideBar = (props: MainSideBarProps) => {
  const location = useLocation();
  const activeLinks = () =>
    props
      .searchData()
      .find(
        (navData: any) =>
          navData.P.name === props.activeSection() && navData.children,
      );
  return (
    <Show when={!props.isCollapsed()}>
      <div class={`bg:ghostwhite r:0|0|15|0 @fade|.3s p:10|20`}>
        <nav class="flex 0px 0px 10px 10px pt:13">
          <div class="group">
            <Icon
              class="icon"
              icon="iconamoon:search"
              style={{ color: "#9e9ea7" }}
            />

            <form autocomplete="off" method="post" action="">
              <input
                placeholder="Search..."
                type="search"
                autocomplete="none"
                class="inputSearch f:14"
                value={props.searchTerm()}
                onInput={(e) => {
                  props.handleSearch(e.target.value);
                }}
              />
            </form>
          </div>
        </nav>
        <nav
          class="mt:10 ml:-12 mr:-12 overflow:auto scrollbar-width:thin"
          style={{
            "max-height": "calc(100vh - 5rem)",
            "overflow-y": "auto",
          }}
        >
          <Show when={activeLinks()}>
            <For each={activeLinks().children}>
              {(nav) => {
                return (
                  <div
                    class="cursor:pointer"
                    style="padding-top: 12px; padding-bottom: 12px;"
                  >
                    <div
                      class={`flex ai:center jc:space-between ${!props.expandedSections().get(nav.P.name) ? "color:#37c" : ""} ${location.pathname === nav.P.url ? "bg:#E5EAFE font-weight:600" : "font-weight:400"} pl:12 f:15 pr:12 capitalize`}
                    >
                      <div onClick={() => props.toggleSection(nav.P.name)}>
                        {nav.P.name}
                      </div>
                      <div>
                        <button
                          class="cursor: pointer;"
                          onClick={(e) => {
                            e.stopPropagation();

                            props.toggleSection(nav.P.name);
                          }}
                        >
                          <Icon
                            icon="mingcute:down-fill"
                            class={"transform 2s ease-in-out"}
                            style={{
                              transition: "transform 0.2s linear",
                              "margin-top": "7px",
                              transform: `${
                                !props.expandedSections().get(nav.P.name)
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)"
                              }`,
                            }}
                          />
                        </button>
                      </div>
                    </div>
                    <Show when={!props.expandedSections().get(nav.P.name)}>
                      <For each={nav.children}>
                        {(child) => {
                          return (
                            <a
                              class={`${location.pathname === child.P.url ? "bg:#E5EAFE font-weight:600" : "font-weight:400"} r:7 f:14 d:flex ai:center p:8|12 color:#4B5563 trs:color|.3s|bg|.3s td:none bg:#E5E7EB:hover m:5px|10px`}
                              href={child.P.url}
                            >
                              <Icon
                                color={`${props.activeSection() === child.P.name ? "#3B82F6" : "#4B5563"}`}
                                icon={props.mainIcon[child.P.url]}
                                height={24}
                                width={24}
                              />
                              <span class="ml:8 color:#4B5563 ">
                                {child.P.name}
                              </span>
                            </a>
                          );
                        }}
                      </For>
                    </Show>
                  </div>
                );
              }}
            </For>
          </Show>
        </nav>
      </div>
    </Show>
  );
};
