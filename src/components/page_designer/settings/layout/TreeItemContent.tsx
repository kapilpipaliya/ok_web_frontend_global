import { Icon } from "@iconify-icon/solid";
import { type Accessor, createMemo } from "solid-js";

import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { getChildrenAttrs } from "../../functions/getChildrenAttrs";
import { nameExpr } from "../utils/nameExpr";
import { TreeItemExpandButton } from "./TreeItemExpandButton";
import { getComponentLabel } from "../../functions/getComponentLabel";

export function TreeItemContent(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );

  const componentName = () => getComponentLabel(graph, props.metaVertex) || props.metaVertex?.P.componentName || "";
  
  return (
    <div
      classList={{
        "d:flex gap:4 ai:center": true,
        "pl:27": !children().length, // bl:1px|dashed|black
      }}
    >
      <TreeItemExpandButton
        hasChildren={!!children().length}
        isCollapsed={props.collapsedKeys().includes(props.metaVertex.id)}
        metaVertexId={props.metaVertex.id}
        toggleExpand={props.toggleExpand}
      />
      <Icon
        height={17}
        icon={
          iconMap[componentName() as keyof typeof iconMap] ??
          "material-symbols:widgets-outline-rounded"
        }
        width={17}
      />
      {nameExpr(props.metaVertex, componentName(), graph)}
    </div>
  );
}
