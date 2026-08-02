import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";

import { getCompanyFaviconVertex } from "./getCompanyFaviconVertex";
import { getCompanySquareLogoUrl } from "./getCompanySquareLogoUrl";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getCompanyFaviconUrl(graph: GraphInterface): string {
  const faviconVertex = getCompanyFaviconVertex(graph);
  return getDownloadLink(faviconVertex) || getCompanySquareLogoUrl(graph);
}
