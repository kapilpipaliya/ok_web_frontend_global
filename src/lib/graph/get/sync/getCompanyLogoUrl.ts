import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { profileImage } from "~/pages/settings/constants";

import type { GraphInterface } from "../../graph";

import { getCompanyLogoVertex } from "./getCompanyLogoVertex";

export function getCompanyLogoUrl(graph: GraphInterface): string {
  const companyLogoVertex = getCompanyLogoVertex(graph);
  return getDownloadLink(companyLogoVertex) || profileImage;
}
