import { Icon } from "@iconify-icon/solid";
import { useLocation } from "@solidjs/router";
import { type Accessor, For, type Setter, Show } from "solid-js";

import { SearchBar } from "~/components/css_properties/SearchBar";

type MainSideBarProps = {
  activeSection: Accessor<string>;
  expandedSections: Accessor<Map<string, boolean>>;
  handleSearch: (input: string) => void;
  isCollapsed: Accessor<boolean>;
  mainIcon: any;
  searchData: Accessor<any>;
  searchTerm: Accessor<string>;
  setSearchTerm: Setter<string>;
  toggleSection: (sectionName: string) => void;
};
export const SubSideBar = (props: Readonly<MainSideBarProps>) => {
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
      <nav
        class={"@fade|.3s bg:ghostwhite min-h:100vh p:10|20 r:0|0|15|0 w:max-content"}
        style={{ "box-shadow": "-1px 3px 4px 3px lightgrey" }}
      >
        <SearchBar
          handleChange={props.handleSearch}
          placeholder="Search..."
          value={props.searchTerm()}
        />
        <nav
          class="{scrollbar-width:thin} ml:-12 mr:-12 mt:10 overflow:auto"
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
                      class={`${
                        props.expandedSections().get(nav.P.name)
                          ? "" : "color:#37c"
                      } ${
                        location.pathname === nav.P.url
                          ? "bg:#E5EAFE font-weight:600"
                          : "font-weight:400"
                      } capitalize flex ai:center f:15 jc:space-between pl:12 pr:12`}
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
                            class={"transform 2s ease-in-out"}
                            icon="mingcute:down-fill"
                            style={{
                              "margin-top": "7px",
                              transform: `${
                                props.expandedSections().get(nav.P.name)
                                  ? "rotate(180deg)" : "rotate(0deg)"
                              }`,
                              transition: "transform 0.2s linear",
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
                              class={`${
                                location.pathname === child.P.url
                                  ? "bg:#E5EAFE font-weight:600"
                                  : "font-weight:400"
                              } trs:color|.3s|bg|.3s td:none ai:center bg:#E5E7EB:hover color:#4B5563 d:flex f:14 m:5px|10px p:8|12 r:7`}
                              href={child.P.url}
                            >
                              <Icon
                                color={`${
                                  props.activeSection() === child.P.name
                                    ? "#3B82F6"
                                    : "#4B5563"
                                }`}
                                height={24}
                                icon={props.mainIcon[child.P.url]}
                                width={24}
                              />
                              <span class="color:#4B5563 ml:8 ">
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
      </nav>
    </Show>
  );
};
