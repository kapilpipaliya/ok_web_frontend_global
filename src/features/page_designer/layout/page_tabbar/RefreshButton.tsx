import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonClass } from "~/pages/admin_layout/constants/constant";

export function RefreshButton(props: { handleRefresh: () => void }) {
  return (
    <IconButton
      class={headerIconButtonClass}
      icon="ph:arrows-counter-clockwise"
      onClick={props.handleRefresh}
      title="Refresh Preview"
    />
  );
}
