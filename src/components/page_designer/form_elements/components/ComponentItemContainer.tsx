import type { JSX } from "solid-js";

import { useGraph, type Vertex } from "~/lib/graph/graph";

import { resetDragDropState } from "../../event_handler/resetDragDropState";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { onCompDragStart } from "./onCompDragStart";

export function ComponentItemContainer(props: {
  child: Vertex;
  children: JSX.Element;
  isHovered: boolean;
  onClick?: (el: MouseEvent) => void;
  onMouseEnter?: (el: MouseEvent) => void;
  onMouseLeave?: (el: MouseEvent) => void;
  ref: (el: HTMLDivElement) => void;
  selectedComponents?: () => Set<Vertex>;
  setSelectedComponents?: (updater: (prev: Set<Vertex>) => Set<Vertex>) => void;
}) {
  const [graph] = useGraph();
  const [, setLayoutStore] = useDesignerLayoutStore() || [];

  const onDragEnd = () => {
    resetDragDropState(setLayoutStore);
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
      onDragEnd={onDragEnd}
      onDragStart={(e) =>
        onCompDragStart(
          e,
          graph,
          props.child.id,
          setLayoutStore,
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
