import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";
import { headerIconButtonCss } from "~/pages/settings/constants";

export const RedirectUrlIconButton = () => {
  const [graph] = useGraph();
  const navigate = useNavigate();

  const redirectUrl = () =>
    getGlobalSettingVertex(graph)?.P.redirectUrlAfterSignin;

  return (
    <Show when={redirectUrl()}>
      <IconButton
        css={[
          headerIconButtonCss,
          `return \`._id {
  margin-left: 2px;
}\`;`,
        ]}
        icon="ph:app-window"
        onClick={() => navigate(redirectUrl()!)}
        size={22}
        title={`Go to ${redirectUrl()}`}
        tooltipGroup="left-buttons"
      />
    </Show>
  );
};
