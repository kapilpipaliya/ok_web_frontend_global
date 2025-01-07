import type { JSX } from "solid-js";

import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { resetDragDropState } from "../../event_handler/resetDragDropState";
import { onCompDragStart } from "./onCompDragStart";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import type { PageLayoutObject } from "../../context/LayoutContext";
import type { FormStoreObject } from "~/components/form/context/FormContext";

export function ComponentItemContainer(props: {
  child: Vertex;
  children: JSX.Element;
  isHovered: boolean;
  onClick?: (el: MouseEvent) => void;
  onDoubleClick?: (fromVertex: Vertex) => void;
  onMouseEnter?: (el: MouseEvent) => void;
  onMouseLeave?: (el: MouseEvent) => void;
  ref: (el: HTMLDivElement) => void;
  selectedComponents?: () => Set<Vertex>;
  setSelectedComponents?: (updater: (prev: Set<Vertex>) => Set<Vertex>) => void;
}) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const onDragEnd = () => {
    resetDragDropState(layoutStoreId, graph, setGraph);
  };

  const baseStyle =
    "background-color:white border-radius:.2rem box-shadow:rgba(0,0,0,0.2)|0px|0px|5px|0px position:relative transition:transform|0.2s|ease-in-out,|box-shadow|0.2s|ease-in-out";

  const hoverStyle = "box-shadow:4px|4px|4px cursor:move";

  const itemStyle = () =>
    props.isHovered ? `${baseStyle} ${hoverStyle}` : baseStyle;

  return (
    <div // NOSONAR
      class={itemStyle()}
      draggable={true}
      onClick={props.onClick}
      onDblClick={() => props.onDoubleClick?.(props.child)}
      onDragEnd={onDragEnd}
      onDragStart={(e) =>
        onCompDragStart(
          e,
          graph,
          setGraph,
          props.child.id,
          layoutStoreId,
          props.selectedComponents,
          props.setSelectedComponents,
        )
      }
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      ref={props.ref}
    >
      {props.children}
    </div>
  );
}
