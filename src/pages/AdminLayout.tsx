import type { JSX } from "solid-js";

import { HomeIcon } from "~/features/page_designer/header/left/HomeIcon";

import { UserDropdownMenuDisplay } from "./auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "./settings/constants";

interface AdminLayoutProps {
  children?: JSX.Element;
}

export function AdminLayout(props: Readonly<AdminLayoutProps>): JSX.Element {
  // const [graph, setGraph] = useGraph();
  // const location = useLocation();
  // const navBarVertexId = generateNewVertexId(graph, setGraph);
  // const globalStoreId = "globalStoreId";

  // // Add new vertex for the navbar
  // addNewVertex(
  //   0,
  //   newVertex(navBarVertexId, ["MainNavBarTitle"], {
  //     class: "bb:1|solid|rgb(212,219,231)",
  //   }),
  //   graph,
  //   setGraph,
  // );

  // // Handle URL change for sidebar visibility
  // const handleUrlChange = () => {
  //   mergeVertexProperties(0, globalStoreId, graph, setGraph, { isSideBarOpen: !isPageDesignerPath(location.pathname) });
  // };

  // createEffect(() => {
  //   handleUrlChange(); // Call the function initially
  //   return location.pathname; // Track changes in pathname
  // });

  return (
    // <div
    // class={`flex ${STYLES.overflow} flex:column`}
    //   classList={{
    //     "flex-grow:1": (graph.vertexes[globalStoreId] as Vertex<GlobalProperties>).P.isSideBarOpen || (graph.vertexes[globalStoreId] as Vertex<GlobalProperties>).P.isSubSideBarOpen,
    //   }}
    // >
    <>
      <header class={SETTINGS_CONSTANTS.HEADER_MENU_CLASS}>
        <HomeIcon url="/admin" />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </header>
      {props.children}
    </>
    // </div>
  );
}
