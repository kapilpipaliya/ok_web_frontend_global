import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";

export function RefreshButton(props: { handleRefresh: () => void }) {
  return (
    <IconButton
      css={headerIconButtonCss}
      size={18}
      icon="ph:arrows-counter-clockwise"
      onClick={props.handleRefresh}
      title="Refresh Preview"
      tooltipGroup="page-buttons"
    />
  );
}
