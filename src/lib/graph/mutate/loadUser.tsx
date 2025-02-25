import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { addNewVertex, replaceVertexProperties } from "./vertex";

// Type for the user data response
export interface UserData {
  profileImage?: Vertex;
  roles?: Vertex[];
  user?: Vertex;
  userSetting?: Vertex;
}

// Function to only fetch user data
export async function fetchUserData(): Promise<UserData> {
  return await getAPI(API.auth.getUserUrl);
}

// Function to handle navigation after user data fetch
export function handleUserNavigation(
  userData: null | UserData,
  navigate?: (path: string) => void,
) {
  if (!userData?.user) {
    // TODO: add support for redirect to same page after login
    navigate?.("/auth/login");
    return false;
  }
  return true;
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
