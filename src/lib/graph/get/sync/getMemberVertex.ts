import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { evalExpression } from "~/lib/expression_eval";
import { profileImage } from "~/pages/admin_layout/constant";

import type { GraphInterface, Vertex } from "../../graph";

export function getMemberVertex(graph: GraphInterface): Vertex {
  return graph.vertexes.member ?? ({ P: {} } as Vertex);
}

export function getProfileImageUrl(graph: GraphInterface): string {
  const profileImageVertex = getProfileImageVertex(graph);
  return getDownloadLink(profileImageVertex) || profileImage;
}

export function getProfileImageVertex(graph: GraphInterface): Vertex | undefined {
  return evalExpression(`->UserProfileImage`, { graph, vertexes: [graph.vertexes.member] })?.[0];
}
