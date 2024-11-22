import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { updateVertex } from "~/lib/graph/mutate/setGraphData";

export function handleUserData(
  data: { [key: string]: any },
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (data.user) {
    setGraph("member", data.user);
  }

  if (data.userSetting) {
    setGraph("userSettingId", data.userSetting.id);
    updateVertex(data.userSetting.id, data.userSetting, graph, setGraph, false);
  }

  if (data.roles) {
    setGraph(
      "userRoles",
      data.roles.map((role: Vertex) => role.id),
    );
    for (const role of data.roles) {
      updateVertex(role.id, role, graph, setGraph, false);
    }
  }
}

export async function loadUser(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  navigate?: (path: string) => void,
  showErrorToast?: (message: string) => void,
): Promise<boolean> {
  setGraph("isLoadingPage", true);

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
    setGraph("isLoadingPage", false);
  }
}
