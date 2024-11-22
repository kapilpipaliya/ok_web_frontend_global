import type { Id, Vertex } from "~/lib/graph/graph";

import { TreeItemExpandButton } from "~/components/page_designer/settings/layout/TreeItemExpandButton";
import { IconButton } from "~/components/styled/IconButton";

import { useFileManagerStore } from "../FileManagerContext";

export function FileManagerTreeItemContent(
  props: Readonly<{
    hasChildren: boolean;
    item: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const handleDoubleClick = () => {
    setFileManagerStore("selectedItem", props.item);
  };
  return (
    <div // NOSONAR
      class="ai:center cursor:pointer d:flex flex:1"
      classList={{
        "bl:1px|dashed|black pl:10": !props.hasChildren,
      }}
      onClick={handleDoubleClick}
    >
      <TreeItemExpandButton
        hasChildren={props.hasChildren}
        isCollapsed={!fileManagerStore.expandedKeys.includes(props.item.id)}
        metaVertexId={props.item.id}
        toggleExpand={props.toggleExpand}
      />
      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon={
          props.item.L[0] === "Folder"
            ? "ic:round-folder"
            : "ic:round-insert-drive-file"
        }
        size={16}
      />
      &nbsp;&nbsp;
      <span>{props.item.P.key || "no key"}</span>
    </div>
  );
}
