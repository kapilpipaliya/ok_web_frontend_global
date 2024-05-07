import { useLocation } from "@solidjs/router";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  untrack,
  useContext,
  JSX,
} from "solid-js";
import { getSublistRows, getSublistRowsForType, Record } from "~/lib/Utils";
import { getChildVertex } from "~/lib/Utils";
import { findVertexByLabelAndUniqueId } from "~/lib/Vertex";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { GraphContext, GraphInterface, Vertex } from "~/lib/graph";
import treeViewFilter from "~/lib/treeViewFilter";
import { WsContext } from "~/lib/ws_events_dispatcher";
import { LoaderNew } from "~/components/custom/LoaderSimple";
import "~/css/sideBarSearch.css";
import { Store } from "solid-js/store"; // Import the CSS file
import { Icon } from "@iconify-icon/solid";
import logo from "~/assets/graphics/sidebarLogo.svg";
export interface navbarDataI {
  children: navbarDataI[];
  expanded: boolean;
  href: string;
  id: string;
  name: string;
}

function getIds(data: navbarDataI[], ids: string[] = []) {
  for (const e of data) {
    if (e.expanded !== undefined) ids.push(e.id);
    getIds(e.children, ids);
  }
  return ids;
}

function Sidebar(props: { isSideBarOpen: boolean; toggleSidebar: () => void }) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const { Ws } = useContext(WsContext);
  const [searchData, setSearchData] = createSignal<navbarDataI[]>([]);
  const location = useLocation();
  const [activeSection, setActiveSection] = createSignal("Home");
  const [searchTerm, setSearchTerm] = createSignal("");
  const [isSearchMode, setIsSearchMode] = createSignal(false);
  const [expandedSections, setExpandedSections] = createSignal<
    Map<string, boolean>
  >(new Map());
  const [isCollapsed, setIsCollapsed] = createSignal(false); // State signal to track collapsible state

  // Function to toggle the expanded state of a section
  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      const newExpandedSections = new Map(prev);
      const isExpanded = newExpandedSections.get(sectionName) ?? true;
      newExpandedSections.set(sectionName, !isExpanded);
      return newExpandedSections;
    });
  };

  createEffect(() => {
    const res = navData();
    if (!res) return;

    if (isSearchMode()) {
      const ids = res
        .map((e) => {
          if (e.expanded !== undefined) return e.id;
          return null;
        })
        .filter((e) => e) as string[];
      return;
    } else {
      setSearchData(res);
    }
  });
  const activeLinks = () =>
    searchData().find((link) => link.name === activeSection() && link.children);
  function handleSearch(input: string) {
    setSearchTerm(input);

    const searchName = input.trim().toLowerCase();
    setIsSearchMode(searchName.length > 0);

    if (searchName.length === 0) return;

    const res = searchData();
    if (!res) return;
    const result: navbarDataI[] = treeViewFilter(res, (node: navbarDataI) =>
      node.name.toLowerCase().includes(searchName),
    );

    setSearchData(result);
  }

  const mainIcon: any = {
    "/admin/dashboards/": "akar-icons:dashboard",
    "/admin/": "fluent:home-24-regular",
    "/admin/DataType": "carbon:data-1",
    "/admin/CompCategory":
      "material-symbols-light:settings-input-component-outline",
    "/admin/Comp": "iconoir:component",
    "/admin/SimpleImport": "uil:import",
    "/admin/backup_restore": "lucide:database-backup",
    "/admin/User": "ci:users",
    "/admin/Role": "eos-icons:role-binding-outlined",
    "/admin/Perm": "tabler:lock-access",
    "/admin/Coll": "ep:collection-tag",
    "/admin/CollCategory": "ic:outline-collections-bookmark",
    "/admin/Page": "iconoir:multiple-pages",
    "/admin/Dashboard": "mage:dashboard-2",
  };
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed());
    props.toggleSidebar();
  };

  const navData = createMemo(() => {
    const nav = findVertexByLabelAndUniqueId(
      "Nav",
      "name",
      "Navigation",
      graph,
    );
    if (!nav) return;

    const record = new Record({ ws: Ws });
    record.load(graph, nav.id);
    untrack(() =>
      record.createMeta(AttrsAdminTableData["Nav"], graph, setGraph),
    );

    return renderNavTreeFromGraph(record, props.isSideBarOpen, graph);
  });

  const sidebarStyle = () =>
    ({
      width: isCollapsed() ? "70px" : "300px",
      background: "#f4f4f4",
      transition: "transform 0.3s ease-in-out",
      transform: props.isSideBarOpen ? "translateX(0)" : "translateX(-100%)",
      "box-shadow": "-15px 0px 31px rgb(95,156,249)",
      "border-right": "1px solid lightgray",
    }) as JSX.CSSProperties;
  return (
    <div class="r:0|10|10|0 rel" style={sidebarStyle()}>
      <Show
        when={navData()}
        fallback={
          <div class="flex jc:center ai:center h:70%">
            <LoaderNew class="h:30 w:30 align-self:center" />
          </div>
        }
      >
        <ul>
          <div>
            <aside class="flex">
              <div
                class="rel bg:#EFF0FB r:0|15|15|0"
                style={`display: flex; padding-bottom: 2rem; flex-direction: column; align-items: center; width: 4rem; height: 100vh`}
              >
                <nav style="display: flex; margin-top: 1rem; padding-top: .5rem; flex-direction: column; flex: 1 1 0%; align-items: center;">
                  <a href="#">
                    <img style="height: 35px; " src={logo} alt="logo" />
                  </a>
                  <div class="flex flex:col gap:10 mt:20">
                    <For each={searchData()}>
                      {(link) => (
                        <Show when={link.href !== "undefined"}>
                          <a
                            class={`${activeSection() === link.name ? "bg:white" : ""} gap:10 `}
                            href={link.href}
                            style={`display: inline-block; padding: 5px 5px 0px 5px; transition-property: background-color, border-color, color, fill, stroke; transition-duration: 200ms; border-radius: 0.5rem; `}
                            onClick={() => setActiveSection(link.name)}
                          >
                            <Icon
                              color={`${activeSection() === link.name ? "#3B82F6" : "#4B5563"}`}
                              icon={mainIcon[link.href]}
                              height={24}
                              width={24}
                            />
                          </a>
                        </Show>
                      )}
                    </For>
                    <Icon
                      height={19}
                      width={19}
                      icon={
                        !isCollapsed()
                          ? "mingcute:arrows-left-line"
                          : "mingcute:arrows-right-line"
                      }
                      style={{
                        "box-shadow": "1px 0px 9px darkgrey",
                        color: "rgb(161,161,169)",
                      }}
                      class="b:1px|solid|lightgrey abs bg:#f3f3f4 r:50% top:2px right:-13px p:3 cursor:pointer text:center"
                      onClick={toggleCollapse}
                    />
                  </div>
                </nav>
              </div>

              <Show when={!isCollapsed()}>
                <div class={`p:20|10 bg:ghostwhite r:0|0|15|0`}>
                  <nav class="flex 0px 0px 10px 10px">
                    <div class="group">
                      <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                        <g>
                          <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                        </g>
                      </svg>
                      <input
                        placeholder="Search..."
                        type="search"
                        class="inputSearch f:14"
                        value={searchTerm()}
                        onInput={(e) => {
                          handleSearch(e.target.value);
                        }}
                      />
                    </div>
                  </nav>
                  <nav class="mt:16 ml:-12 mr:-12 overflow:auto">
                    <Show when={activeLinks()}>
                      <For each={activeLinks()?.children}>
                        {(nav) => {
                          return (
                            <div
                              class="cursor:pointer"
                              style="padding-top: 12px; padding-bottom: 12px;"
                            >
                              <div
                                class={`flex ai:center jc:space-between ${!expandedSections().get(nav.name) ? "color:#37c" : ""} ${location.pathname === nav.href ? "bg:#E5EAFE font-weight:600" : "font-weight:400"} pl:12 f:15 pr:12 capitalize`}
                              >
                                <div onClick={() => toggleSection(nav.name)}>
                                  {nav.name}
                                </div>
                                <div>
                                  <button
                                    class="cursor: pointer;"
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      toggleSection(nav.name);
                                    }}
                                  >
                                    <Icon
                                      icon="mingcute:down-fill"
                                      class={"transform 2s ease-in-out"}
                                      style={{
                                        transition: "transform 0.2s linear",
                                        "margin-top": "7px",
                                        transform: `${
                                          !expandedSections().get(nav.name)
                                            ? "rotate(0deg)"
                                            : "rotate(180deg)"
                                        }`,
                                      }}
                                    />
                                  </button>
                                </div>
                              </div>
                              <Show when={!expandedSections().get(nav.name)}>
                                <For each={nav.children}>
                                  {(child) => (
                                    <a
                                      class={`${location.pathname === child.href ? "bg:#E5EAFE font-weight:600" : "font-weight:400"} r:7 f:14 d:flex ai:center p:8|12 color:#4B5563 trs:color|.3s|bg|.3s td:none bg:#E5E7EB:hover m:5px|10px`}
                                      href={child.href}
                                    >
                                      <Icon
                                        color={`${activeSection() === child.name ? "#3B82F6" : "#4B5563"}`}
                                        icon={mainIcon[child.href]}
                                        height={24}
                                        width={24}
                                      />
                                      <span class="ml:8 color:#4B5563 ">
                                        {child.name}
                                      </span>
                                    </a>
                                  )}
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
            </aside>
          </div>
        </ul>
      </Show>
    </div>
  );
}

export default Sidebar;

export const renderNavTreeFromGraph = (
  record: Record,
  showNav: boolean,
  graph: Store<GraphInterface>,
) => {
  // !!!TODO!!!: This code can we written in the code itself
  const getChildren = (meta: Vertex, vertex: Vertex) => {
    // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    const result = [] as any[];

    const metaVertexes = getSublistRowsForType(graph, "MetaAttr", meta);
    const attrMeta = metaVertexes.find((meta) => meta.P.name === "Attr");

    if (!attrMeta) return result;

    const children = getSublistRows(graph, attrMeta, vertex);

    for (const child of children) {
      const name = child.P.name;
      const func = child.P.func;
      const expanded = child.P.expanded;
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      const navItem = {} as any;

      if (func === "Table") {
        const collVertex = getChildVertex(graph, ["$0Coll"], child).vertex;
        // TODO: Check Permission
        if (collVertex) {
          // TODO: Check Permission
          // add to result if its allowed
          navItem.name = name;
          navItem.href = `/admin/${collVertex.P.name}`;
        } else {
          const formVertex = getChildVertex(graph, ["$0Form"], child).vertex;
          if (formVertex) {
            // TODO: Check Permission
            // add to result if its allowed
            navItem.name = name;
            navItem.href = `/admin/${formVertex.P.name}`;
          } else {
            const url = "" + child.P.url;
            navItem.name = name;
            navItem.href = url;
          }
        }
      } else {
        const url = "" + child.P.url;
        navItem.name = name;
        navItem.href = url;
      }
      navItem.expanded = expanded;
      navItem.id = createUniqueId();

      // rome-ignore lint/style/noNonNullAssertion: <explanation>
      navItem.children = getChildren(attrMeta!, child);

      result.push(navItem);
    }
    return result;
  };

  const navigation: navbarDataI[] = getChildren(
    record.metaVertex,
    record.vertex,
  );

  return navigation;
};
