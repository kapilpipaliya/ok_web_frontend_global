import type { GraphInterface } from "~/lib/graph/GraphContext";

import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { profileImage } from "~/pages/settings/constants";

import { getCompanySquareLogoVertex } from "./getCompanySquareLogoVertex";

export function getCompanySquareLogoUrl(graph: GraphInterface): string {
  const companyLogoVertex = getCompanySquareLogoVertex(graph);
  return getDownloadLink(companyLogoVertex) || profileImage;
}
