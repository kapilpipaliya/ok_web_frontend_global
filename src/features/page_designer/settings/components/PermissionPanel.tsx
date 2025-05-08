import type { Vertex } from "~/lib/graph/graph";
import { TablePanel } from "./TablePanel";

interface PermissionPanelProps {
  title?: string;
  data?: Vertex;
  meta: Vertex;
  isNoPermissionCheck?: boolean;
  isRealTime?: boolean;
}

export function PermissionPanel(props: PermissionPanelProps) {
  return (
    <TablePanel
      title={props.title || "Permissions"}
      icon="ph:lock"
      data={props.data}
      meta={props.meta}
      addButtonAriaLabel="Add new permission"
      isNoPermissionCheck={props.isNoPermissionCheck ?? true}
      isRealTime={props.isRealTime ?? false}
    />
  );
}
