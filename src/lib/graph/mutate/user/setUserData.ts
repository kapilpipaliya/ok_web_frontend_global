import type { SetStoreFunction } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { updateVertex } from "../core/setGraphData";
import {
  addNewVertex,
  mergeVertexProperties,
  replaceVertexProperties,
} from "../core/vertex";
import { setSelectionValue } from "../selection/setSelectionValue";

interface UserData {
  profileImage?: Vertex;
  roles?: Vertex[];
  user?: Vertex;
  userSetting?: Vertex;
}

export function setUserData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  data: UserData,
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
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userRoles: data.roles.map((role) => role.id),
    });
    for (const role of data.roles) {
      updateVertex(role.id, role, graph, setGraph);
    }
  }

  if (data.user && data.profileImage) {
    if (data.profileImage.id && !graph.vertexes[data.profileImage.id]) {
      addNewVertex(0, data.profileImage, graph, setGraph);
    }
    setSelectionValue(
      0,
      graph.vertexes.member,
      graph,
      setGraph,
      {
        id: "",
        L: [],
        P: {
          type: "UserProfileImage",
        },
      } as unknown as Vertex,
      data.profileImage.id,
    );
  }
}

function saveUser(
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
