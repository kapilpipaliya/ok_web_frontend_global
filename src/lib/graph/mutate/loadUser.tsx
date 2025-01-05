import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { updateVertex } from "~/lib/graph/mutate/setGraphData";
import { addNewVertex, mergeVertexProperties, replaceVertexProperties } from "./vertex";

export function handleUserData(
  data: { [key: string]: any },
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) { 
  if (data.user) {
    saveUser(data.user, graph, setGraph);
  }

  if (data.userSetting) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, { userSettingId: data.userSetting.id });
    updateVertex(data.userSetting.id, data.userSetting, graph, setGraph);
  }

  if (data.roles) {
    mergeVertexProperties(
      0,
      "globalStoreId",
      graph,
      setGraph,
      { userRoles: data.roles.map((role: Vertex) => role.id) }
    );
    for (const role of data.roles) {
      updateVertex(role.id, role, graph, setGraph);
    }
  }
}

export function saveUser(
  user: any,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!graph.vertexes["member"]) {
    addNewVertex(0, {
      ...user,
      L: ["member"],
      id: "member"
    }, graph, setGraph);
  } else {
    replaceVertexProperties(0, "member", graph, setGraph, user, {cloneProperties: false});
  }
}

export async function loadUser(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  navigate?: (path: string) => void,
  showErrorToast?: (message: string) => void,
): Promise<boolean> {
  mergeVertexProperties(0, "globalStoreId", graph, setGraph, { isLoadingPage: true });

  try {
    const data = await getAPI(API.getUserUrl);
    if (data) {
      handleUserData(data, graph, setGraph);
      if (data.user) {
        return true;
      }
      // TODO: add support for redirect to same page after login
      navigate?.("/auth/login");
    }
    return false;
  } catch (err: unknown) {
    if (err instanceof Error && err.message) {
      showErrorToast?.(err.message);
      navigate?.("/auth/login");
    }
    return false;
  } finally {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, { isLoadingPage: false });
  }
}
