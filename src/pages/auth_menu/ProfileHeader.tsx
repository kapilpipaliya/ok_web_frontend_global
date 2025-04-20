import type { JSX } from "solid-js";
import { As } from "~/components/As";

import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { getProfileImageUrl } from "~/lib/graph/get/sync/user/getProfileImageUrl";
import { useGraph } from "~/lib/graph/GraphContext";
import { css } from "~/lib/styles";

export interface ProfileHeaderProps {
  profileImage: string;
}

export function ProfileHeader(): JSX.Element {
  const [graph] = useGraph();
  const member = () => getMemberVertex(graph);

  const displayName = () => member()?.P?.username ?? "Guest User";
  const displayEmail = () => member()?.P?.email ?? "guest@gmail.com";

  return (
    <As as="li" css={css`
  display: flex;
  margin-bottom: 5px;
  padding: 10px;
`}>
      <As as="div"
        css={css`
  height: 45px;
  width: 45px;
`}
        style={`background-size:cover; background-image: url(${getProfileImageUrl(graph)})`}
      />
      <As as="div" css={css`
  margin-left: 10px;
  margin-right: 1rem;
`}>
        <As as="div" css={css`
  font-weight: bold;
  text-align: start;
`}>{displayName()}</As>
        <As as="div" css={css`
  font-size: 14px;
  text-align: start;
`}>{displayEmail()}</As>
      </As>
    </As>
  );
}
