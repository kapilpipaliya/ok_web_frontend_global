import type { GraphInterface } from "~/lib/graph/GraphContext";

import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { profileImage } from "~/pages/settings/constants";

import { getCompanyRectangularLogoVertex } from "./getCompanyRectangularLogoVertex";

export function getCompanyRectangularLogoUrl(graph: GraphInterface): string {
  const companyLogoVertex = getCompanyRectangularLogoVertex(graph);
  return getDownloadLink(companyLogoVertex) || profileImage;
}
