import type { Id, Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { TreeItemExpandButton } from "~/features/page_designer/settings/layout/TreeItemExpandButton";

import { useFileManagerStore } from "../FileManagerContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
    <As
      as="div"
      css={css`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex: 1;
  ${
    props.hasChildren
      ? ""
      : `
    border-left: 1px dashed black;
    padding-left: 10px;
  `
  }
`}
      onClick={handleDoubleClick}
    >
      <TreeItemExpandButton
        hasChildren={props.hasChildren}
        isCollapsed={!fileManagerStore.expandedKeys.includes(props.item.id)}
        metaVertexId={props.item.id}
        toggleExpand={props.toggleExpand}
      />
      <IconButton
        css={css`
  cursor: pointer;
  margin-right: 5px;
  color: gray;
  background-color: transparent;
  border: none;
  padding: 0;
  &:hover {
    color: gray_890;
  }
`}
        icon={
          props.item.L[0] === "Folder"
            ? "ic:round-folder"
            : "ic:round-insert-drive-file"
        }
        size={16}
      />
      &nbsp;&nbsp;
      <span>{props.item.P.key || "no key"}</span>
    </As>
  );
}
