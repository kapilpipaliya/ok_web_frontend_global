import { useLocation } from "@solidjs/router";
import { createEffect, type JSX } from "solid-js";
import { STYLES } from "~/components/styled/constants/styles";

import { type GlobalProperties, useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { isPageDesignerPath } from "~/lib/isPageDesignerPath";

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
        <>{props.children}</>
      // </div>
  );
}
