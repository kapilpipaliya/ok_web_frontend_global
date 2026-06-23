import type { SetStoreFunction } from "solid-js/store";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { Id } from "~/lib/graph/type/id";

function removeVertex(
  txnId: number,
  vertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const vertex = graph.vertexes[vertexId];
  if (!vertex) {
    return;
  }

  for (const edges of [vertex.IN, vertex.OUT]) {
    for (const edgeIds of Object.values(edges)) {
      for (const edgeId of [...(edgeIds ?? [])]) {
        deleteEdge(txnId, edgeId, graph, setGraph);
      }
    }
  }

  deleteVertex(txnId, vertexId, graph, setGraph);
}

export function setUserData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  data: UserData,
) {
  if (data.user) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userId: data.user.id,
    });
  }

  if (data.userSetting) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userSettingId: data.userSetting.id,
    });
  }

  if (data.roles) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userRoles: data.roles.map((role) => role.id),
    });
  }

  if (data.profileImage) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      profileImageId: data.profileImage.id,
    });
  }
}

export function clearUserData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const txnId = 0;
  const { userId, userSettingId, profileImageId } = getGlobalStore(graph).P;

  // Remove user (all IN/OUT edges; shared targets like Role keep their vertex)
  if (userId) {
    removeVertex(txnId, userId, graph, setGraph);
  }

  // Remove user-owned vertices left behind after edge cleanup
  for (const id of [userSettingId, profileImageId]) {
    if (id) {
      removeVertex(txnId, id, graph, setGraph);
    }
  }

  mergeVertexProperties(txnId, "globalStoreId", graph, setGraph, {
    userId: undefined,
    userSettingId: undefined,
    userRoles: undefined,
    profileImageId: undefined,
  });
}
