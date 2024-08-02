import type { Id, Vertex } from "~/lib/graph/graph";

import { TreeItemExpandButton } from "~/components/page_designer/settings/layout/TreeItemExpandButton";

import { useFileManagerStore } from "../FileManagerContext";

export function FileManagerTreeItemContent(props: { hasChildren: boolean; item: Vertex; toggleExpand: (itemId: Id) => void; }) {
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const handleDoubleClick = () => {
    setFileManagerStore('selectedItem', props.item);
  };
  return <div
    classList={{
      "bl:1px|dashed|black pl:10": !props.hasChildren,
      "d:flex ai:center": true,
    }}
    onDblClick={handleDoubleClick}
  >
    &nbsp;
    <TreeItemExpandButton
      hasChildren={props.hasChildren}
      isCollapsed={!fileManagerStore.expandedKeys.includes(props.item.id)}
      metaVertexId={props.item.id}
      toggleExpand={props.toggleExpand} />
    &nbsp;
    {props.item.P.name}
  </div>;
}
