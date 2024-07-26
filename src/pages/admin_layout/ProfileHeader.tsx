import { type JSX, Show } from "solid-js";

import { useGraph } from "~/lib/graph/graph";
export interface ProfileHeaderProps {
  profileImage: string;
}


export function ProfileHeader(props: Readonly<ProfileHeaderProps>): JSX.Element {
  const [graph] = useGraph();

  return (
    <li class="flex mb:5px p:10px">
      <div class="h:45 r:50% w:45" style={`background-size:cover;background-image: url(${props.profileImage})`} />
      <div class="ml:10 mr:1rem">
        <div class="f:15 font-weight:bold text-align:start">
          <Show fallback={graph.member?.P?.username ?? "anonymous"} when={!graph.member?.P?.username}>
            Guest User
          </Show>
        </div>
        <div class="f:13 text-align:start">
          <Show fallback={graph.member?.P?.email ?? "anonymous@gmail.com"} when={!graph.member?.P?.email}>
            guest@gmail.com
          </Show>
        </div>
      </div>
    </li>
  );
}
