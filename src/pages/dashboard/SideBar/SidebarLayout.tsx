import {
  createEffect,
  createMemo,
  createResource,
  createSignal, JSX,
  onMount,
  Show,
  useContext
} from "solid-js";

import { LoaderNew } from "~/components/custom/LoaderSimple";
import "~/css/sideBarSearch.css";
import { MainSideBar } from "./MainSideBar";
import { SubSideBar } from "./SubSideBar";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { graph } from "neo4j-driver";
import { GraphContext } from "~/lib/graph/graph";
import { expressionString } from "~/lib/Utils";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { setGraphData } from "~/lib/websocket/ws_events";
import { useLocation } from "@solidjs/router";

export interface navbarDataI {
  children: navbarDataI[];
  expanded: boolean;
  href: string;
  id: string;
  name: string;
}


function Sidebar(props: {  }) {
  const [searchData, setSearchData] = createSignal<any>([]);
  const [navData, setNavData] = createSignal<any>([]);
  const [activeSection, setActiveSection] = createSignal("Home");
  const [searchTerm, setSearchTerm] = createSignal("");
  const [isSearchMode, setIsSearchMode] = createSignal(false);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [expandedSections, setExpandedSections] = createSignal<
    Map<string, boolean>
  >(new Map());
  const [isCollapsed, setIsCollapsed] = createSignal(false); // State signal to track collapsible state

  // Function to toggle the expanded state of a section
  const toggleMainSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      const newExpandedSections = new Map(prev);
      const isExpanded = newExpandedSections.get(sectionName) ?? true;
      newExpandedSections.set(sectionName, !isExpanded);
      return newExpandedSections;
    });
  };
  
  function handleSearch(input: string) {
    setSearchTerm(input);

    const searchName = input.trim().toLowerCase();
    setIsSearchMode(searchName.length > 0);

    if (searchName.length > 0) {
      debugger
      const filteredData = filterNavData(graph.navigationData, searchName);
      setSearchData(filteredData);
    } else {
      setSearchData(graph.navigationData);
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

  const sidebarIcon: any = {
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
    '/admin/Form': "fluent:form-28-regular",
    "/admin/CollCategory": "ic:outline-collections-bookmark",
    "/admin/Page": "iconoir:multiple-pages",
    "/admin/Dashboard": "mage:dashboard-2",
  };

  const toggleSectionCollapse = () => {
    setIsCollapsed(!isCollapsed());
  };

  

  async function getNavData() {
    const data: any = await getTreeDataMGCall({
      collection: expressionString({ coll: "Nav", filter: "Navigation" }),
      // TODO: Dont display "Form" Component
      child: {
        collection: "->NavAttr",
        child: { collection: "->NavAttr", child: { collection: "->NavAttr" } },
      },
    });

    return data;
  }

  // When loading from server side, the client side will not run createResource function again.
  // so setState inside it will not be triggered.
  // const [navData] = createResource(async () => {
  //   const data = await getNavData();
  //   return data && data.children[0].children;
  // });

  onMount(async () => {
    const data = await getNavData();
    if (data) {
      setGraphData(graph,setGraph,data.graph);
      setNavData(data.children[0].children);
      setSearchData(data.children[0].children);
      setGraph('navigationData', data.children[0].children);
    }
  });

  const sidebarStyle = () =>
    ({
      width: isCollapsed() ? "70px" : "310px",
      background: "#f4f4f4",
      transition: "transform 0.3s ease-in-out",
      transform: graph.isSideBarOpen ? "translateX(0)" : "translateX(-100%)",
      "box-shadow": "-15px 0px 31px rgb(95,156,249)",
      "border-right": "1px solid lightgray",
    }) as JSX.CSSProperties;

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
              <MainSideBar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                navData={navData()}
                mainIcon={sidebarIcon}
                isCollapsed={isCollapsed}
                toggleCollapse={toggleSectionCollapse}
              />

              <SubSideBar
                activeSection={activeSection}
                expandedSections={expandedSections}
                handleSearch={handleSearch}
                mainIcon={sidebarIcon}
                isCollapsed={isCollapsed}
                searchData={searchData}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                toggleSection={toggleMainSection}
              />
            </aside>
          </div>
        </ul>
      </Show>
    </div>
  );
}

export default Sidebar;

// export function renderNavTreeFromGraph(
//   meta: Vertex,
//   data: Vertex,
//   showNav: boolean,
//   graph: Store<GraphInterface>,
// ) {
//   // !!!TODO!!!: This code can we written in the code itself
//   const getChildren = (meta: Vertex, vertex: Vertex) => {
//     // rome-ignore lint/suspicious/noExplicitAny: <explanation>
//     const result = [] as any[];

//     const metaVertexes = getSublistRowsForType(graph, "MetaAttr", meta);
//     const attrMeta = metaVertexes.find((meta) => meta.P.name === "Attr");

//     if (!attrMeta) return result;

//     const children = getSublistRows(graph, attrMeta, vertex);

//     for (const child of children) {
//       const name = child.P.name;
//       const func = child.P.func;
//       const expanded = child.P.expanded;
//       // rome-ignore lint/suspicious/noExplicitAny: <explanation>
//       const navItem = {} as any;

//       if (func === "Table") {
//         const collVertex = getChildVertex(graph, ["$0Coll"], child).vertex;
//         // TODO: Check Permission
//         if (collVertex) {
//           // TODO: Check Permission
//           // add to result if its allowed
//           navItem.name = name;
//           navItem.href = `/admin/${collVertex.P.name}`;
//         } else {
//           const formVertex = getChildVertex(graph, ["$0Form"], child).vertex;
//           if (formVertex) {
//             // TODO: Check Permission
//             // add to result if its allowed
//             navItem.name = name;
//             navItem.href = `/admin/${formVertex.P.name}`;
//           } else {
//             const url = "" + child.P.url;
//             navItem.name = name;
//             navItem.href = url;
//           }
//         }
//       } else {
//         const url = "" + child.P.url;
//         navItem.name = name;
//         navItem.href = url;
//       }
//       navItem.expanded = expanded;
//       navItem.id = createUniqueId();

//       // rome-ignore lint/style/noNonNullAssertion: <explanation>
//       navItem.children = getChildren(attrMeta!, child);

//       result.push(navItem);
//     }
//     return result;
//   };

//   const navigation: navbarDataI[] = getChildren(meta, data);

//   return navigation;
// }
