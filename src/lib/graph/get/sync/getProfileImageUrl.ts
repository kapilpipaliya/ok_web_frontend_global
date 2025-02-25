import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";

import type { GraphInterface } from "../../graph";

import { getProfileImageVertex } from "./getMemberVertex";
import {profileImage} from "~/pages/settings/constants";

export function getProfileImageUrl(graph: GraphInterface): string {
  const profileImageVertex = getProfileImageVertex(graph);
  return getDownloadLink(profileImageVertex) || profileImage;
}
