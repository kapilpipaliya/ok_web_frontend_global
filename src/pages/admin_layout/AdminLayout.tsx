import { useLocation } from "@solidjs/router";
import { createEffect, type JSX } from "solid-js";

import { useGraph } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { isPageDesignerPath } from "~/lib/isPageDesignerPath";

import { AuthenticateUser } from "./AuthenticateUser";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";

interface AdminLayoutProps {
  children?: JSX.Element;
}

export function AdminLayout(props: Readonly<AdminLayoutProps>): JSX.Element {
  const [graph, setGraph] = useGraph();
  const location = useLocation();
  const navBarVertexId = generateNewVertexId(graph, setGraph);

  // Add new vertex for the navbar
  addNewVertex(
    0,
    newVertex(navBarVertexId, ["MainNavBarTitle"], {
      class: "bb:1|solid|rgb(212,219,231)",
    }),
    graph,
    setGraph,
  );

  // Handle URL change for sidebar visibility
  const handleUrlChange = () => {
    setGraph("isSideBarOpen", !isPageDesignerPath(location.pathname));
  };

  createEffect(() => {
    handleUrlChange(); // Call the function initially
    return location.pathname; // Track changes in pathname
  });

  return (
    <AuthenticateUser>
      <div
        class="flex {scrollbar-width:thin} flex:column overflow:auto"
        classList={{
          "flex-grow:1": graph.isSideBarOpen || graph.isSubSideBarOpen,
        }}
      >
        {props.children}
      </div>
    </AuthenticateUser>
  );
}
