import { Icon } from "@iconify-icon/solid";
import {
  Show, createSignal,
  useContext
} from "solid-js";

import { Checkbox } from "~/components/solid_blocks";
import { iconMap } from "~/lib/constants";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";

import { onClickAddComponent } from "../../../lib/drag_drop/onClickAddComponent";
import { useDesignerLayoutStore } from "../LayoutContext";
import { OpenComponentSettings } from "../OpenComponentSettings";

export function ComonentItem(props: Readonly<{ child: Vertex; }>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore() || [];
  const [isHovered, setIsHovered] = createSignal(false);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>()
  );

  const handleCheckboxChange = (event: Event, id: Id) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      setSelectedComponents((prev) => new Set(prev).add(graph.vertexes[id]));
    } else {
      setSelectedComponents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(graph.vertexes[id]);
        return newSet;
      });
    }
  };

  const baseStyle = {
    "align-items": "center",
    "background-color": "white",
    "border-radius": ".2rem",
    "box-shadow": "rgba(0, 0, 0, 0.2) 0px 0px 5px 0px",
    display: "flex",
    "flex-direction": "row",
    gap: "5px",
    "justify-content": "space-between",
    "margin-left": "3px",
    "margin-right": "3px",
    padding: "10px 0px",
    "place-content": "center",
    position: "relative",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  };

  const hoverStyle = {
    boxShadow: "4px 4px 4px",
    cursor: "move",
  };

  const itemStyle: any = () => isHovered() ? { ...baseStyle, ...hoverStyle } : baseStyle;

  return (
    <button
      draggable={true}
      onDragStart={(e) => {
        e.stopPropagation();
        setLayoutStore('draggedVertices', []);
        const dataTransfer = selectedComponents().size > 0
          ? Array.from(selectedComponents())
          : [graph.vertexes[props.child.id]];
        setLayoutStore('draggedVertices', (prev) => [...prev, ...dataTransfer]);
        setSelectedComponents(new Set<Vertex>());
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ondblclick={(e) => {
        setLayoutStore('draggedVertices', [graph.vertexes[props.child.id]]);
        onClickAddComponent(
          graph,
          setGraph,
          layoutStore.formData.txnId,
          layoutStore.draggedVertices[0],
          layoutStore.formData.formData || {},
          layoutStore.selectedId !== -1
            ? layoutStore.selectedId
            : layoutStore.formData.formData.id
        );
        setLayoutStore('draggedVertices', []);
      }}
      style={itemStyle()}
      type="button"
    >
      <Show when={isHovered()}>
        <OpenComponentSettings class="cursor:pointer position:absolute right:3px top:3px" id={props.child.id} />
      </Show>
      {/* @ts-ignore  */}
      <Show
        when={isHovered() ||
          selectedComponents().has(graph.vertexes[props.child.id])}
      >
        <Checkbox
          // @ts-ignore
          checked={selectedComponents().has(graph.vertexes[props.child.id])}
          onChange={(e) => handleCheckboxChange(e, props.child.id)}
          style={{ left: "7px", position: "absolute", top: "-2px" }}
          wrapperStyle={{ height: "19px", width: "19px" }} />
      </Show>
      <div
        class="pt:5px flex gap:5px ai:center"
        style={{ "flex-flow": "column" }}
      >
        <Icon
          height={24}
          icon={iconMap[props.child?.P.name] ??
            "material-symbols:widgets-outline-rounded"}
          width={24} />
        <span style={{ "font-size": "14px" }}>{props.child?.P.label || props.child?.P.name}</span>
      </div>
    </button>
  );
}
