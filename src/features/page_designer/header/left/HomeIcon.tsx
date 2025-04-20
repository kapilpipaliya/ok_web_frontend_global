import { useNavigate } from "@solidjs/router";

import { IconButton } from "~/components/styled/IconButton";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { useGraph } from "~/lib/graph/GraphContext";
import { getHomeUrl } from "~/lib/urls/getHomeUrl";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { css } from "~/lib/styles";

export const HomeIcon = () => {
  const [graph] = useGraph();
  const navigate = useNavigate();
  const isSystemSubDomain = () =>
    getMemberVertex(graph).P.subDomain === "super";

  const context = () => {
    if (isSystemSubDomain()) {
      return "system";
    }
    if (isAdminRole(graph)) {
      return "admin";
    }
    return "default";
  };

  return (
    <IconButton
      css={[headerIconButtonCss, css`
  margin-left: 2px;
`]}
      icon="ph:house"
      onClick={() => navigate(getHomeUrl(context()))}
      size={22}
      title="Home"
      tooltipGroup="left-buttons"
    />
  );
};
