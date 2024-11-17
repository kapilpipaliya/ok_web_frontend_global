import { IconButton } from "~/components/styled/IconButton";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { useZIndex } from "~/components/fields/ZIndex";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { ComponentName } from "./ComponentName";
import { DeleteButton } from "./DeleteButton";
import { DuplicateButton } from "./DuplicateButton";
import { ImportHtmlButton } from "./ImportHtmlButton";
import { ParentButton } from "./ParentButton";
import { PreviewCSSButton } from "./PreviewCSSButton";
import { PropertyDrawer } from "./PropertyDrawer";
import { SaveAsTemplateButton } from "./SaveAsTemplateButton";

interface SelectedAttrConfigPopOverProps {
  item: Vertex;
}

export function SelectedAttrConfigPopOver(
  props: Readonly<SelectedAttrConfigPopOverProps>,
) {
  const zIndex = useZIndex();
  const [, setLayoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  const getComponentName = () =>
    getChildVertex(graph, ["$0Comp"], props.item).vertex?.P.key;

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
        <SaveAsTemplateButton item={props.item} size={20} />
        <PreviewCSSButton item={props.item} size={20} />
        <ImportHtmlButton item={props.item} size={20} />
        <DeleteButton componentName={getComponentName()} item={props.item} />
      </div>
    </span>
  );
}
