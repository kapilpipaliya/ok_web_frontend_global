import { useNavigate } from "@solidjs/router";

import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonClass } from "~/pages/settings/constants";
import { HomeUrlContext, getHomeUrl } from "~/lib/urls";
import { useGraph } from "~/lib/graph/graph";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { getMemberVertex } from "~/lib/graph/get/sync/user/getMemberVertex";

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
      class={`${headerIconButtonClass} ml:2`}
      icon="ph:house"
      onClick={() => navigate(getHomeUrl(context()))}
      size={22}
      title="Home"
      tooltipGroup="left-buttons"
    />
  );
};
