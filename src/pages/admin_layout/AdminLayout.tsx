import type { SetStoreFunction } from "solid-js/store";

import { useLocation, useNavigate, } from "@solidjs/router";
import { type JSX, Show, createEffect, onMount } from "solid-js";

import { useToast } from "~/components/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { PageContext, useLoading, } from "~/lib/contexts";
import { type GraphInterface, useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { isPageDesignerPath } from "~/lib/utils";
import { updateVertex } from "~/lib/websocket/setGraphData";
import { Navbar } from "~/pages/admin_layout/Navbar";

import { DropdownMenuDisplay } from "./DropdownMenuDisplay";

interface AdminLayoutProps {
  children?: JSX.Element;
}

const AuthenticateUser = (props: { children: JSX.Element }) => {
  const [graph, setGraph] = useGraph();
  const [loadingSite, setLoadingSite] = useLoading();
  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  const loadUser = async (graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) => {
    setLoadingSite(true);
    try {
      const data = await getAPI(API.getUserUrl);
      if (data) {
        if (data.user) {
          setGraph("member", data.user);
        }
        if (data.userSetting) {
          setGraph("userSettingId", data.userSetting.id);
          updateVertex(data.userSetting.id, data.userSetting, graph, setGraph, false);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        showErrorToast(err.message);
        navigate("/auth/login");
      }
    } finally {
      setLoadingSite(false);
    }
  };

  onMount(() => {
    loadUser(graph, setGraph);
  });

  return (
    <>
      <Show when={loadingSite()}>
        Loading
      </Show>
      <Show when={!loadingSite()}>
        {props.children}
      </Show>
    </>
  );
};


export function AdminLayout(props: Readonly<AdminLayoutProps>): JSX.Element {
  console.log('renew')
  const [graph, setGraph] = useGraph();
  const location = useLocation();
  const navBarVertexId = graph.newVertexId;

  // Add new vertex for the navbar
  addNewVertex(
    0,
    newVertex(navBarVertexId, ["MainNavBarTitle"], { class: `bb:1|solid|rgb(212,219,231)` }),
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
        <PageContext.Provider
          value={{
            events: {
              setTitle: (title: string) =>
                mergeVertexProperties(0, navBarVertexId, graph, setGraph, { title }),
            },
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
        </PageContext.Provider>
      </div>
    </AuthenticateUser>
  );
}

