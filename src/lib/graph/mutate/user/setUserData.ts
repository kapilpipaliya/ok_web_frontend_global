import type { SetStoreFunction } from "solid-js/store";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { UserData } from "~/lib/graph/mutate/user/loadUser";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";

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
  // Get current user IDs from global store
  const globalStore = getGlobalStore(graph);
  const { userId } = globalStore.P;

  // Delete user and all related vertices
  if (userId && graph.vertexes[userId]) {
    const userVertex = graph.vertexes[userId];

    // Delete all OUT edges and their target vertices
    for (const edgeType of Object.keys(userVertex.OUT)) {
      const edgeIds = userVertex.OUT[edgeType];
      if (edgeIds) {
        for (const edgeId of edgeIds) {
          const edge = graph.edges[edgeId];
          if (edge) {
            const targetVertexId = edge.E;

            // Delete the edge first
            deleteEdge(0, edgeId, graph, setGraph);

            // Delete the target vertex if it exists
            // (will fail silently if vertex has dependencies, which is fine for shared resources like Roles)
            if (graph.vertexes[targetVertexId]) {
              deleteVertex(0, targetVertexId, graph, setGraph);
            }
          }
        }
      }
    }

    // Now delete the user vertex (should have no OUT edges now)
    deleteVertex(0, userId, graph, setGraph);
  }

  // Clear all user-related IDs from global store
  mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
    userId: undefined,
    userSettingId: undefined,
    userRoles: undefined,
    profileImageId: undefined,
  });
}
