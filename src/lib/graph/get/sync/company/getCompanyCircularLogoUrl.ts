import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { profileImage } from "~/pages/settings/constants";

import type { GraphInterface } from "../../../graph";

import { getCompanyCircularLogoVertex } from "./getCompanyCircularLogoVertex";

export function getCompanyCircularLogoUrl(graph: GraphInterface): string {
  const companyLogoVertex = getCompanyCircularLogoVertex(graph);
  return getDownloadLink(companyLogoVertex) || profileImage;
}
