import { Icon } from "@iconify-icon/solid";
import { type Accessor, createMemo } from "solid-js";

import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { nameExpr } from "../utils/nameExpr";
import {TreeItemExpandButton} from "./TreeItemExpandButton";

export function TreeItemContent(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>
) {
  const [graph, setGraph] = useGraph();
  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex)
  );
  const getComponent = () =>
    getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.name as string;

  return (
    <div
      classList={{
        "bl:1px|dashed|black pl:10": !children().length,
        "d:flex ai:center": true,
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
          iconMap[getComponent() as keyof typeof iconMap] ?? "material-symbols:widgets-outline-rounded"
        }
        width={17}
      />
      &nbsp;&nbsp;
      {nameExpr(props.metaVertex, getComponent())}
    </div>
  );
}
