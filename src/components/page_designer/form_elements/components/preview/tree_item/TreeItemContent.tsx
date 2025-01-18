import { createMemo } from "solid-js";

import { TreeItemExpandButton } from "~/components/page_designer/settings/layout/TreeItemExpandButton";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import { getCompChildren } from "../../getCompChildren";

export function TreeItemContent(
  props: Readonly<{
    collapsedKeys: Id[];
    item: Vertex;
    edgeName: string;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph] = useGraph();
  const children = createMemo(() => getCompChildren([props.item], props.edgeName, graph));

  return (
    <div
      classList={{
        "bl:1px|dashed|black pl:10": !children().length,
        "d:flex ai:center": true,
      }}
    >
      <TreeItemExpandButton
        hasChildren={!!children().length}
        isCollapsed={props.collapsedKeys.includes(props.item.id)}
        metaVertexId={props.item.id}
        toggleExpand={props.toggleExpand}
      />
      {props.item.P.key}
    </div>
  );
}
