import type { JSX } from "solid-js";

import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { getProfileImageUrl } from "~/lib/graph/get/sync/user/getProfileImageUrl";
import { useGraph } from "~/lib/graph/GraphContext";

export interface ProfileHeaderProps {
  profileImage: string;
}

export function ProfileHeader(): JSX.Element {
  const [graph] = useGraph();
  const member = () => getMemberVertex(graph);

  const displayName = () => member()?.P?.username ?? "Guest User";
  const displayEmail = () => member()?.P?.email ?? "guest@gmail.com";

  return (
    <li class="flex mb:5px p:10px">
      <div
        class="h:45 w:45"
        style={`background-size:cover;background-image: url(${getProfileImageUrl(graph)})`}
      />
      <div class="ml:10 mr:1rem">
        <div class="font-weight:bold text-align:start">{displayName()}</div>
        <div class="f:14 text-align:start">{displayEmail()}</div>
      </div>
    </li>
  );
}
