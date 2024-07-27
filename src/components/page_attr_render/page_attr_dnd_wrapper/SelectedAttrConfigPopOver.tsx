import { Show, createSignal } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { useZIndex } from "~/components/ZIndex";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { type Vertex, useGraph, } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { ComponentName } from "./ComponentName";
import { DeleteButton } from "./DeleteButton";
import { DuplicateButton } from "./DuplicateButton";
import { ParentButton } from "./ParentButton";
import { PropertyDrawer } from "./PropertyDrawer";
import { SaveAsTemplateMenu } from "./SaveAsTemplateMenu";

interface SelectedAttrConfigPopOverProps {
  item: Vertex;
}

export function SelectedAttrConfigPopOver(props: SelectedAttrConfigPopOverProps) {
  const zIndex = useZIndex();
  const [, setLayoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  const getComponentName = () =>
    getChildVertex(graph, ["$0Comp"], props.item).vertex?.P.name;

  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);

  return (
    <span class="position:relative">
      <div
        class={`flex ai:center bg:rgb(37,99,235) bottom:100% color:white gap:5px p:0.25rem position:absolute r:5px|5px|0px|0px z:${zIndex}`}
      >
        <IconButton
          class="cursor:grab"
          draggable={true}
          icon="material-symbols:drag-indicator"
          onClick={() => {}}
          onDragStart={(e) => handleDragStart(e, setLayoutStore, props.item)}
          size={20}
          title="Move"
        />
        <ComponentName componentName={getComponentName()} />
        <PropertyDrawer itemId={props.item.id} />
        <ParentButton item={props.item} />
        <DuplicateButton item={props.item} />
        <IconButton
          class="cursor:pointer"
          icon="fluent:save-as-24-regular"
          onClick={() => setShowModal(true)}
          ref={(el) => (saveAsTemplateRef = el)}
          size={20}
          title="Save as Template"
        />
        <Show when={showModal()}>
          <SaveAsTemplateMenu
            item={props.item}
            onClose={() => setShowModal(false)}
            onMouseLeave={() => setShowModal(false)}
            parentRef={saveAsTemplateRef!}
          />
        </Show>
        <DeleteButton
          componentName={getComponentName()}
          item={props.item}
        />
      </div>
    </span>
  );
}
