
import { useLocation, } from "@solidjs/router";
import { createEffect, type JSX, Show } from "solid-js";

import { useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { isPageDesignerPath } from "~/lib/isPageDesignerPath";
import { Navbar } from "~/pages/admin_layout/Navbar";

import { AuthenticateUser } from "./AuthenticateUser";
import { DropdownMenuDisplay } from "./DropdownMenuDisplay";

interface AdminLayoutProps {
  children?: JSX.Element;
}

export function AdminLayout(props: Readonly<AdminLayoutProps>): JSX.Element {
  const [graph, setGraph] = useGraph();
  const location = useLocation();
  const navBarVertexId = graph.newVertexId;

  // Add new vertex for the navbar
  addNewVertex(
    0,
    newVertex(navBarVertexId, ["MainNavBarTitle"], { class: 'bb:1|solid|rgb(212,219,231)' }),
    graph,
    setGraph
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
          <Show when={location.pathname.includes("/admin/") && !isPageDesignerPath(location.pathname)}>
            <Navbar
              meta={graph.vertexes[navBarVertexId]}
              right={<DropdownMenuDisplay />}
              showCloseDrawerBtn={location.pathname.includes("/admin/")}
              toggleSidebar={() => setGraph("isSideBarOpen", (prev) => !prev)}
            />
          </Show>
          {props.children}
      </div>
    </AuthenticateUser>
  );
}

