import { useLocation } from "@solidjs/router";
import { createEffect, createSignal, type JSX, onMount, Show } from "solid-js";

import { LoaderNew } from "~/components/LoaderSimple";
import { getTreeDataMGCall } from "~/cypher/get/client/getTreeDataMGCall";
import { useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { MainSideBar } from "./MainSideBar";
import { SubSideBar } from "./SubSideBar";

export interface navbarDataI {
  children: navbarDataI[];
  expanded: boolean;
  href: string;
  id: string;
  name: string;
}

export function Sidebar() {
  const [searchData, setSearchData] = createSignal<any>([]);
  const [navData, setNavData] = createSignal<any>([]);
  const [activeSection, setActiveSection] = createSignal("Home");
  const [searchTerm, setSearchTerm] = createSignal("");
  const [_isSearchMode, setIsSearchMode] = createSignal(false);
  const [graph, setGraph] = useGraph();
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
    "/admin/": "fluent:home-24-regular",
    "/admin/backup_restore": "lucide:database-backup",
    "/admin/Coll": "ep:collection-tag",
    "/admin/CollCategory": "ic:outline-collections-bookmark",
    "/admin/Comp": "iconoir:component",
    "/admin/CompCategory":
      "material-symbols-light:settings-input-component-outline",
    "/admin/Dashboard": "mage:dashboard-2",
    "/admin/dashboards/": "akar-icons:dashboard",
    "/admin/DataType": "carbon:data-1",
    "/admin/EmailTemplatePage": "mdi:email-outline",
    "/admin/ErrorPage": "icon-park-outline:error",
    "/admin/Form": "fluent:form-28-regular",
    "/admin/Page": "iconoir:multiple-pages",
    "/admin/Perm": "tabler:lock-access",
    "/admin/Role": "eos-icons:role-binding-outlined",
    "/admin/SimpleImport": "uil:import",
    "/admin/TemplatePage": "eos-icons:templates-outlined",
    "/admin/ThankYouPage": "icon-park-outline:doc-success",
    "/admin/User": "ci:users",
  };

  const toggleSectionCollapse = () => {
    setIsCollapsed(!isCollapsed());
  };

  const location = useLocation();

  const handleUrlChange = () => {
    const path = location.pathname;

    if (path.includes("/admin")) {
      setGraph("isSideBarOpen", true);
      setGraph("isSubSideBarOpen", true);
    } else {
      setGraph("isSideBarOpen", false);
      setGraph("isSubSideBarOpen", false);
    }
  };

  createEffect(() => {
    handleUrlChange(); // Call the function initially
    return location.pathname; // Track changes in pathname
  });

  async function getNavData() {
    const data: any = await getTreeDataMGCall({
      // TODO: Dont display "Form" Component
      child: {
        child: { child: { collection: "->NavAttr" }, collection: "->NavAttr" },
        collection: "->NavAttr",
      },
      collection: "g:'Nav[Navigation]'",
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
      setGraphData(graph, setGraph, data.graph);
      setNavData(data.children[0].children);
      setSearchData(data.children[0].children);
      setGraph("navigationData", data.children[0].children);
    }
  });

  const sidebarStyle = () =>
    ({
      background: "#f4f4f4",
      "border-right": "1px solid lightgray",
      "box-shadow": "-15px 0px 31px rgb(95,156,249)",
      display: graph.isSideBarOpen ? "" : "none",
      transform: graph.isSideBarOpen ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.3s ease-in-out",
      // width: isCollapsed() ? "70px" : "310px",
    }) as JSX.CSSProperties;

  return (
    <aside class="flex r:0|10|10|0" style={sidebarStyle()}>
      <Show
        fallback={
          <div class="flex ai:center jc:center">
            <LoaderNew />
          </div>
        }
        when={navData()}
      >
        <MainSideBar
          activeSection={activeSection}
          isCollapsed={isCollapsed}
          mainIcon={sidebarIcon}
          navData={navData()}
          setActiveSection={setActiveSection}
          toggleCollapse={toggleSectionCollapse}
        />

        <SubSideBar
          activeSection={activeSection}
          expandedSections={expandedSections}
          handleSearch={handleSearch}
          isCollapsed={isCollapsed}
          mainIcon={sidebarIcon}
          searchData={searchData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          toggleSection={toggleMainSection}
        />
      </Show>
    </aside>
  );
}
