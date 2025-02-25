import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { profileImage } from "~/pages/settings/constants";

import type { GraphInterface } from "../../graph";

import { getProfileImageVertex } from "./getMemberVertex";

export function getProfileImageUrl(graph: GraphInterface): string {
  const profileImageVertex = getProfileImageVertex(graph);
  return getDownloadLink(profileImageVertex) || profileImage;
}
