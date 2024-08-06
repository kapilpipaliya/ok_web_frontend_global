import { Icon } from "@iconify-icon/solid";
import { createSignal, Show } from "solid-js";

import { Checkbox } from "~/components/solid_blocks/checkbox/checkbox";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { resetDragDropState } from "../../event_handler/resetDragDropState";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { OpenComponentSettings } from "../../OpenComponentSettings";

export function ComonentItem(props: Readonly<{ child: Vertex }>) {
  const [graph, _setGraph] = useGraph();
  const [_layoutStore, setLayoutStore] = useDesignerLayoutStore() || [];
  const [isHovered, _setIsHovered] = createSignal(false);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
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

  const baseStyle =
    "background-color:white border-radius:.2rem box-shadow:rgba(0,0,0,0.2)|0px|0px|5px|0px position:relative transition:transform|0.2s|ease-in-out,|box-shadow|0.2s|ease-in-out";

  const hoverStyle = "box-shadow:4px|4px|4px cursor:move";

  const itemStyle = () =>
    isHovered() ? `${baseStyle} ${hoverStyle}` : baseStyle;

  return (
    <div // NOSONAR
      class={itemStyle()}
      draggable={true}
      onDragEnd={() => {
        resetDragDropState(setLayoutStore);
      }}
      onDragStart={(e) => {
        e.stopPropagation();
        setLayoutStore("draggedVertices", []);
        const dataTransfer =
          selectedComponents().size > 0
            ? Array.from(selectedComponents())
            : [graph.vertexes[props.child.id]];
        setLayoutStore("draggedVertices", (prev) => [...prev, ...dataTransfer]);
        setSelectedComponents(new Set<Vertex>());
      }}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      // ondblclick={() => {
      //   setLayoutStore("draggedVertices", [graph.vertexes[props.child.id]]);
      //   onClickAddComponent(
      //     graph,
      //     setGraph,
      //     layoutStore.formData.txnId,
      //     layoutStore.draggedVertices[0],
      //     layoutStore.formData.formData || {},
      //     layoutStore.selectedId !== -1
      //       ? layoutStore.selectedId
      //       : layoutStore.formData.formData.id,
      //   );
      //   setLayoutStore("draggedVertices", []);
      // }}
    >
      <Show when={isHovered()}>
        <OpenComponentSettings
          class="cursor:pointer position:absolute right:3px top:3px"
          id={props.child.id}
        />
      </Show>

      <Show
        when={
          isHovered() ||
          selectedComponents().has(graph.vertexes[props.child.id])
        }
      >
        <Checkbox
          checked={selectedComponents().has(graph.vertexes[props.child.id])}
          class="left:7px position:absolute top:2px"
          onChange={(e) => handleCheckboxChange(e, props.child.id)}
          wrapperClass="height:19px width:19px"
        />
      </Show>
      <div class="flex {flex-flow:column} ai:center gap:5px pt:5px">
        <Icon
          height={24}
          icon={
            iconMap[props.child?.P.name] ??
            "material-symbols:widgets-outline-rounded"
          }
          width={24}
        />
        <span class="font-size:14px">
          {props.child?.P.label || props.child?.P.name}
        </span>
      </div>
    </div>
  );
}
