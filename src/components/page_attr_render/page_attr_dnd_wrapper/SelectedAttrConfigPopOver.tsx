import { Icon } from "@iconify-icon/solid";
import { Show, createSignal, useContext } from "solid-js";

import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { Tooltip } from "~/components/solid_blocks";
import { cloneLayoutAndChildren } from "~/lib/drag_drop/cloneLayoutAndChildren";
import { getChildVertex, getParentVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex } from "~/lib/graph/graph";

import { useToast } from "../../Toast";
import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { PropertyDrawer } from "./PropertyDrawer";
import { SaveAsTemplateMenu } from "./SaveAsTemplateMenu";

export function SelectedAttrConfigPopOver(props: { item: Vertex; }) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useContext(GraphContext)!;
  const getComponentName = () => getChildVertex(graph, ["$0Comp"], props.item).vertex?.P.name;
  const { showSuccessToast } = useToast();

  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);

  return (
    <span class="position:relative ">
      <div class="flex ai:center bg:rgb(37,99,235) bottom:100% color:white gap:5px p:0.25rem position:absolute r:5px|5px|0px|0px z:50">
        <Tooltip content={"Name"} nowrap>
          <div style={{ display: "flex", "font-size": "0.875rem", "line-height": "1.25rem", "margin-right": "4px" }}>
            {getComponentName()}
          </div>
        </Tooltip>
        <PropertyDrawer itemId={props.item.id} />
        <Tooltip content={"Move"} nowrap>
          <Icon
            class="flex cursor:pointer"
            draggable={true}
            height={20}
            icon={"material-symbols-light:drag-pan-rounded"}
            onDragStart={(e) => handleDragStart(e, setLayoutStore, props.item)}
            width={20} />
        </Tooltip>
        <Tooltip content={"Parent"} nowrap>
          <Icon
            class="flex cursor:pointer"
            height={20}
            icon={"mdi:arrow-up"}
            onClick={() => {
              const parentResult = getParentVertex(["Attr"], props.item, graph);
              if (parentResult.error) return;
              onLayoutItemClick(setLayoutStore, parentResult.vertex!, graph, setGraph);
            }}
            width={20} />
        </Tooltip>
        <Tooltip content={"Duplicate"}>
          <Icon
            class="flex cursor:pointer"
            height={20}
            icon={"mage:copy"}
            onClick={() => cloneLayoutAndChildren(props.item, undefined, undefined, layoutStore.formData.txnId, graph, setGraph, layoutStore.formData.formData)}
            width={20} />
        </Tooltip>
        <Tooltip content={"Save as Template"}>
          <Icon
            class="flex cursor:pointer"
            height={20}
            icon={"fluent:save-as-24-regular"}
            onClick={() => setShowModal(true)}
            ref={el => saveAsTemplateRef = el}
            width={20} />
        </Tooltip>
        <Tooltip content={"Delete"}>
          <Icon
            class="flex cursor:pointer"
            height={20}
            icon={"fluent:delete-20-regular"}
            onClick={() => deleteLayoutAttr(layoutStore, setLayoutStore, props.item, graph, setGraph, layoutStore.formData.txnId, getComponentName(), showSuccessToast)}
            width={20} />
        </Tooltip>
        <Show when={showModal()}>
          <SaveAsTemplateMenu item={props.item} onClose={() => setShowModal(false)} onMouseLeave={() => setShowModal(false)} parentRef={saveAsTemplateRef!} />
        </Show>
      </div>
    </span>
  );
}
