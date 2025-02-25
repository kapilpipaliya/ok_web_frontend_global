import { useNavigate } from "@solidjs/router";

import { IconButton } from "~/components/styled/IconButton";

import {headerIconButtonClass} from "~/pages/settings/constants";

export const HomeIcon = (props: { url: string }) => {
  const navigate = useNavigate();

  return (
    <IconButton
      class={`${headerIconButtonClass} ml:2`}
      icon="ph:house"
      onClick={() => navigate(props.url)}
      size={22}
      title="Home"
      tooltipGroup="left-buttons"
    />
  );
};
