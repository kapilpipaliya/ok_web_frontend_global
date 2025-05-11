import { Icon } from "@iconify-icon/solid";
import { type Accessor, createMemo } from "solid-js";

import type { Id, Vertex } from "~/lib/graph/graph";

import { nameExpr } from "~/features/page_designer/settings/functions/nameExpr";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph } from "~/lib/graph/GraphContext";
import { iconMap } from "~/lib/ui/iconMap";

import { getComponentName } from "../../functions/component/getComponentLabel";
import { getChildrenAttrs } from "../../functions/layout/getChildrenAttrs";
import { TreeItemExpandButton } from "./TreeItemExpandButton";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { getTreeItemColor } from "./treeUtils";

export function TreeItemContent(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
    parentIndex?: number;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );

  const componentVertex = createMemo(() => {
    return evalExpression("->$0Comp", {
      graph,
      vertexes: [props.metaVertex],
    })?.[0];
  });
  const componentName = () =>
    getComponentName(componentVertex(), props.metaVertex);

  return (
    <As
      as="div"
      css={css`
  display: flex;
  gap: 4px;
  align-items: center;
  ${children().length ? "" : "padding-left: 24px;"}
`}
      // bl:1px|dashed|black
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
          componentVertex()?.P.icon ??
          iconMap[componentVertex()?.L[0] as keyof typeof iconMap] ??
          iconMap[componentName() as keyof typeof iconMap] ??
          "ph:circle"
        }
        style={{ color: getTreeItemColor(props.parentIndex) }}
        noobserver
        width={17}
      />
      {nameExpr(props.metaVertex, componentName(), graph)}
    </As>
  );
}
