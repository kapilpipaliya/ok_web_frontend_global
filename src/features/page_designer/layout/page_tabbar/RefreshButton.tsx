import { IconButton } from "~/components/styled/IconButton";

import {headerIconButtonClass} from "~/pages/settings/constants";

export function RefreshButton(props: { handleRefresh: () => void }) {
  return (
    <IconButton
      class={headerIconButtonClass}
      icon="ph:arrows-counter-clockwise"
      onClick={props.handleRefresh}
      title="Refresh Preview"
      tooltipGroup="page-buttons"
    />
  );
}
