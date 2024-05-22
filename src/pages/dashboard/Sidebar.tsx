import { useLocation } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  createUniqueId,
  For,
  JSX,
  Show,
  untrack,
  useContext,
} from "solid-js";
import { getChildVertex, getTreeData } from "~/lib/graph/get/sync/traverse";
import {
  createMeta, getSublistRows,
  getSublistRowsForType
} from "~/lib/graph/mutate/form_functions";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { GraphContext, GraphInterface, Vertex } from "~/lib/graph/graph";

import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { LoaderNew } from "~/components/custom/LoaderSimple";
import "~/css/sideBarSearch.css";
import { Store } from "solid-js/store"; // Import the CSS file
import { Icon } from "@iconify-icon/solid";
import logo from "~/assets/graphics/sidebarLogo.svg";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { getTreeDataAsync } from "~/lib/graph/get/async/traverse";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";

export interface navbarDataI {
  children: navbarDataI[];
  expanded: boolean;
  href: string;
  id: string;
  name: string;
}

function treeViewFilter(
  nodes: navbarDataI[],
  cb: (node: navbarDataI) => boolean,
): any {
  return nodes
    .map((node) => {
      if (cb(node)) return node;
      const children = treeViewFilter(node.children || [], cb);
      return children.length && { ...node, children };
    })
    .filter(Boolean);
}

function Sidebar(props: { isSideBarOpen: boolean; toggleSidebar: () => void }) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const { Ws } = useContext(WsContext);
  const [searchData, setSearchData] = createSignal<any>([]);
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

  const activeLinks = () => searchData().find((navData: any) => navData.P.name === activeSection() && navData.children);

  function handleSearch(input: string) {
    setSearchTerm(input);

    const searchName = input.trim().toLowerCase();
    setIsSearchMode(searchName.length > 0);

    if (searchName.length > 0) {
      const filteredData = filterNavData(navData(), searchName);
      setSearchData(filteredData);
    } else {
      setSearchData(navData());
    }
  }

  const filterNavData = (data: any, searchTerm: any) => {
    const searchLower = searchTerm.toLowerCase();
    return data
      .map((item: any) => {
        if (item.name.toLowerCase().includes(searchLower)) {
          return item;
        }
        if (item.children) {
          const filteredChildren = filterNavData(item.children, searchTerm);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }
        return null;
      })
      .filter((item: any) => item !== null);
  };

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
  };

  async function getNavData() {
    const data: any = await await getTreeDataMGCall({
      collection: "g:'Nav[Navigation]'",
      // TODO: Dont display "Form" Component
      child: { collection: "->NavAttr", child: { collection: "->NavAttr", child: { collection: "->NavAttr" } } },
    });
    return data.children[0].children;
  }

  // When loading from server side, the client side will not run createResource function again.
  // so setState inside it will not be triggered.
  const [navData] = createResource(async () => {
    const data = await getNavData();
    
    return data;
  });
  createEffect(() => {
    if (navData()) {
      setSearchData(navData());
    }
  })

  const sidebarStyle = () =>
    ({
      width: isCollapsed() ? "70px" : "310px",
      background: "#f4f4f4",
      transition: "transform 0.3s ease-in-out",
      transform: props.isSideBarOpen ? "translateX(0)" : "translateX(-100%)",
      "box-shadow": "-15px 0px 31px rgb(95,156,249)",
      "border-right": "1px solid lightgray",
    }) as JSX.CSSProperties;

  const SubSideBar = () => {
    return <Show when={!isCollapsed()}>
      <div class={`bg:ghostwhite r:0|0|15|0 @fade|.3s p:10|20`}>
        <nav class="flex 0px 0px 10px 10px pt:13">
          <div class="group">
            <Icon
              class="icon"
              icon="iconamoon:search"
              style={{ color: "#9e9ea7" }} />

            <form autocomplete="off" method="post" action="">
              <input
                placeholder="Search..."
                type="search"
                autocomplete="none"
                class="inputSearch f:14"
                value={searchTerm()}
                onInput={(e) => {
                  handleSearch(e.target.value);
                }} />
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
                      class={`flex ai:center jc:space-between ${!expandedSections().get(nav.P.name) ? "color:#37c" : ""} ${location.pathname === nav.P.url ? "bg:#E5EAFE font-weight:600" : "font-weight:400"} pl:12 f:15 pr:12 capitalize`}
                    >
                      <div onClick={() => toggleSection(nav.P.name)}>
                        {nav.P.name}
                      </div>
                      <div>
                        <button
                          class="cursor: pointer;"
                          onClick={(e) => {
                            e.stopPropagation();

                            toggleSection(nav.P.name);
                          }}
                        >
                          <Icon
                            icon="mingcute:down-fill"
                            class={"transform 2s ease-in-out"}
                            style={{
                              transition: "transform 0.2s linear",
                              "margin-top": "7px",
                              transform: `${!expandedSections().get(nav.P.name)
                                ? "rotate(0deg)"
                                : "rotate(180deg)"}`,
                            }} />
                        </button>
                      </div>
                    </div>
                    <Show when={!expandedSections().get(nav.P.name)}>
                      <For each={nav.children}>
                        {(child) => {
                          return (
                            <a
                              class={`${location.pathname === child.P.url ? "bg:#E5EAFE font-weight:600" : "font-weight:400"} r:7 f:14 d:flex ai:center p:8|12 color:#4B5563 trs:color|.3s|bg|.3s td:none bg:#E5E7EB:hover m:5px|10px`}
                              href={child.P.url}
                            >
                              <Icon
                                color={`${activeSection() === child.P.name ? "#3B82F6" : "#4B5563"}`}
                                icon={mainIcon[child.P.url]}
                                height={24}
                                width={24} />
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
    </Show>;
  }

  const MainSideBar = () => {
    return <div
      class="rel bg:#E5EAFE r:0|15|15|0"
      style={`display: flex; padding-bottom: 2rem; flex-direction: column; align-items: center; width: 4rem; height: 100vh`}
    >
      <nav style="display: flex; margin-top: 1rem; padding-top: .5rem; flex-direction: column; flex: 1 1 0%; align-items: center;">
        <a href="#">
          <img style="height: 35px; " src={logo} alt="logo" />
        </a>
        <div class="flex flex:col gap:10 mt:20">
          <For each={navData()}>
            {(navNode) => (
              <Show when={navNode.P.url !== "undefined"}>
                <a
                  class={`${activeSection() === navNode.P.name ? "bg:white color:#37c" : ""} gap:10 `}
                  href={navNode.P.url}
                  style={`display: inline-block; padding: 5px 5px 0px 5px; transition-property: background-color, border-color, color, fill, stroke; transition-duration: 200ms; border-radius: 0.5rem; `}
                  onClick={() => setActiveSection(navNode.P.name)}
                >
                  <Icon
                    color={`${activeSection() === navNode.P.name ? "#3B82F6" : "#4B5563"}`}
                    icon={mainIcon[navNode.P.url]}
                    height={24}
                    width={24} />
                </a>
              </Show>
            )}
          </For>
          <Icon
            height={19}
            width={19}
            icon={!isCollapsed()
              ? "mingcute:arrows-left-line"
              : "mingcute:arrows-right-line"}
            style={{
              "box-shadow": "1px 0px 9px darkgrey",
              color: "rgb(161,161,169)",
            }}
            class="b:1px|solid|lightgrey abs bg:#f3f3f4 r:50% top:2px right:-13px p:3 cursor:pointer text:center"
            onClick={toggleCollapse} />
        </div>
      </nav>
    </div>;
  }
  return (
    <div class="r:0|10|10|0 rel" style={sidebarStyle()}>
      <Show
        when={navData()}
        fallback={
          <div class="flex jc:center ai:center">
            <LoaderNew />
          </div>
        }
      >
        <ul>
          <div>
            <aside class="flex">
              <MainSideBar />
              <SubSideBar />
            </aside>
          </div>
        </ul>
      </Show>
    </div>
  );

}

export default Sidebar;

export function renderNavTreeFromGraph(meta: Vertex,
  data: Vertex,
  showNav: boolean,
  graph: Store<GraphInterface>) {
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

  const navigation: navbarDataI[] = getChildren(meta, data);

  return navigation;
}
