import { type JSX, Show } from "solid-js";

import {
  getMemberVertex,
} from "~/lib/graph/get/sync/getMemberVertex";
import { getProfileImageUrl } from "~/lib/graph/get/sync/getProfileImageUrl";
import { useGraph } from "~/lib/graph/graph";
export interface ProfileHeaderProps {
  profileImage: string;
}

export function ProfileHeader(
  _props: Readonly<ProfileHeaderProps>,
): JSX.Element {
  const [graph] = useGraph();

  return (
    <li class="flex mb:5px p:10px">
      <div
        class="h:45 w:45"
        style={`background-size:cover;background-image: url(${getProfileImageUrl(graph)})`}
      />
      <div class="ml:10 mr:1rem">
        <div class="f:15 font-weight:bold text-align:start">
          <Show
            fallback={getMemberVertex(graph)?.P?.username ?? "anonymous"}
            when={!getMemberVertex(graph)?.P?.username}
          >
            Guest User
          </Show>
        </div>
        <div class="f:13 text-align:start">
          <Show
            fallback={getMemberVertex(graph)?.P?.email ?? "anonymous@gmail.com"}
            when={!getMemberVertex(graph)?.P?.email}
          >
            guest@gmail.com
          </Show>
        </div>
      </div>
    </li>
  );
}
