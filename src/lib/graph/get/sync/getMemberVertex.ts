import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { evalExpression } from "~/lib/expression_eval";
import { defaultLogo, profileImage } from "~/pages/admin_layout/constants/constant";

import type { GraphInterface, Vertex } from "../../graph";

import { getGlobalSettingVertex } from "./getGlobalThemeVertex";
export function getCompanyLogoUrl(graph: GraphInterface): string {
  const companyLogoVertex = getCompanyLogoVertex(graph);
  return getDownloadLink(companyLogoVertex) || defaultLogo;
}

export function getCompanyLogoVertex(graph: GraphInterface): undefined | Vertex {
  return evalExpression(`->CompanyLogo`, { graph, vertexes: [getGlobalSettingVertex(graph)] })?.[0];
}

export function getMemberVertex(graph: GraphInterface): Vertex {
  return graph.vertexes.member ?? ({ P: {} } as Vertex);
}

export function getProfileImageUrl(graph: GraphInterface): string {
  const profileImageVertex = getProfileImageVertex(graph);
  return getDownloadLink(profileImageVertex) || profileImage;
}

export function getProfileImageVertex(graph: GraphInterface): undefined | Vertex {
  return evalExpression(`->UserProfileImage`, { graph, vertexes: [graph.vertexes.member] })?.[0];
}
