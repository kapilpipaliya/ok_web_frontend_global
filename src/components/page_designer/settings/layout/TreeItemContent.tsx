import { Icon } from "@iconify-icon/solid";
import { type Accessor, createMemo } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { evalExpression } from "~/lib/expression_eval";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { getChildrenAttrs } from "../../functions/getChildrenAttrs";
import { getComponentName } from "../../functions/getComponentLabel";
import { nameExpr } from "../utils/nameExpr";
import { TreeItemExpandButton } from "./TreeItemExpandButton";
export function TreeItemContent(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );

  const componentVertex = createMemo(() => {
    return evalExpression("->$0Comp", {
      graph,
      vertexes: [props.metaVertex],
    })?.[0];
  });
  const componentName = () => getComponentName(componentVertex(), props.metaVertex);
  
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
          iconMap[componentVertex()?.L[0] as keyof typeof iconMap] ??
          iconMap[componentName() as keyof typeof iconMap] ??
          "ph:circle"
        }
        noobserver
        width={17}
      />
      {nameExpr(props.metaVertex, componentName(), graph)}
    </div>
  );
}
