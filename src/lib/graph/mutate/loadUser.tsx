import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { updateVertex } from "~/lib/graph/mutate/setGraphData";

import { setSelectionValue } from "./setSelectionValue";
import {
  addNewVertex,
  mergeVertexProperties,
  replaceVertexProperties,
} from "./vertex";

export function handleUserData(
  data: { [key: string]: any },
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (data.user) {
    saveUser(data.user, graph, setGraph);
  }

  if (data.userSetting) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userSettingId: data.userSetting.id,
    });
    updateVertex(data.userSetting.id, data.userSetting, graph, setGraph);
  }

  if (data.roles) {
    // To speed up we save userRoles in globalStoreId, if cause problems add edges to roles
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userRoles: data.roles.map((role: Vertex) => role.id),
    });
    for (const role of data.roles) {
      updateVertex(role.id, role, graph, setGraph);
    }
  }
  if (data.user && data.profileImage) {
    if (data.profileImage.id) {
      if (!graph.vertexes[data.profileImage.id]) {
        addNewVertex(
          0,
          data.profileImage,
          graph,
          setGraph,
        );
      }
    }
    setSelectionValue(0, graph.vertexes.member, graph, setGraph, {
      id: "",
      L: [],
      P: {
        type: "UserProfileImage",
      },
    } as unknown as Vertex, data.profileImage.id);
  }
}

export async function loadUser(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  navigate?: (path: string) => void,
  showErrorToast?: (message: string) => void,
): Promise<boolean> {
  mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
    isLoadingPage: true,
  });

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
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      isLoadingPage: false,
    });
  }
}

export function saveUser(
  user: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (graph.vertexes.member) {
    replaceVertexProperties(0, "member", graph, setGraph, user.P, {
      cloneProperties: false,
    });
  } else {
    addNewVertex(
      0,
      {
        ...user,
        id: "member",
        L: ["member"],
      },
      graph,
      setGraph,
    );
  }
}
