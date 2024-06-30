import { Icon } from "@iconify-icon/solid";
import {
  Show, createSignal,
  useContext
} from "solid-js";
import { Checkbox } from "~/components/solid_blocks";
import { GraphContext, type Vertex, type Id } from "~/lib/graph/graph";
import { onClickAddComponent } from "../../../lib/drag_drop/onClickAddComponent";
import { iconMap } from "~/lib/constants";
import { OpenComponentSettings } from "../OpenComponentSettings";
import { useDesignerLayoutStore } from "../LayoutContext";

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
    "border-radius": ".2rem",
    "margin-left": "3px",
    "margin-right": "3px",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "justify-content": "space-between",
    "background-color": "white",
    display: "flex",
    "flex-direction": "row",
    "align-items": "center",
    position: "relative",
    gap: "5px",
    padding: "10px 0px",
    "place-content": "center",
    "box-shadow": "rgba(0, 0, 0, 0.2) 0px 0px 5px 0px",
  };

  const hoverStyle = {
    cursor: "move",
    boxShadow: "4px 4px 4px",
  };

  const itemStyle: any = () => isHovered() ? { ...baseStyle, ...hoverStyle } : baseStyle;

  return (
    <button
      type="button"
      style={itemStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
    >
      <Show when={isHovered()}>
        <OpenComponentSettings id={props.child.id} class="cursor:pointer position:absolute right:3px top:3px" />
      </Show>
      {/* @ts-ignore  */}
      <Show
        when={isHovered() ||
          selectedComponents().has(graph.vertexes[props.child.id])}
      >
        <Checkbox
          wrapperStyle={{ height: "19px", width: "19px" }}
          style={{ position: "absolute", top: "-2px", left: "7px" }}
          onChange={(e) => handleCheckboxChange(e, props.child.id)}
          // @ts-ignore
          checked={selectedComponents().has(graph.vertexes[props.child.id])} />
      </Show>
      <div
        class="pt:5px flex gap:5px ai:center"
        style={{ "flex-flow": "column" }}
      >
        <Icon
          icon={iconMap[props.child?.P.name] ??
            "material-symbols:widgets-outline-rounded"}
          width={24}
          height={24} />
        <span style={{ "font-size": "14px" }}>{props.child?.P.label || props.child?.P.name}</span>
      </div>
    </button>
  );
}
