import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";

import { useZIndex } from "~/components/ZIndex";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { getChildVertex, getParentVertex } from "~/lib/graph/get/sync/traverse";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useToast } from "../../Toast";
import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { PropertyDrawer } from "./PropertyDrawer";
import { SaveAsTemplateMenu } from "./SaveAsTemplateMenu";

function IconButton(props: {
  draggable?: boolean;
  icon: string;
  onClick: () => void;
  onDragStart?: (e: DragEvent) => void;
  title: string;
}) {
  return (
    <button draggable={props.draggable} onClick={props.onClick} onDragStart={props.onDragStart} title={props.title}>
      <Icon class="flex cursor:pointer" height={20} icon={props.icon} width={20} />
    </button>
  );
}

export function SelectedAttrConfigPopOver(props: { item: Vertex }) {
  const zIndex = useZIndex();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const getComponentName = () =>
    getChildVertex(graph, ["$0Comp"], props.item).vertex?.P.name;
  const { showSuccessToast } = useToast();

  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);

  return (
    <span class="position:relative ">
      <div
        class={`flex ai:center bg:rgb(37,99,235) bottom:100% color:white gap:5px p:0.25rem position:absolute r:5px|5px|0px|0px z:${zIndex}`}
      >
        <div class="display:flex font-size:0.875rem line-height:1.25rem margin-right:4px" title="Name">
          {getComponentName()}
        </div>
        <PropertyDrawer itemId={props.item.id} />
        <IconButton
          draggable={true}
          icon="material-symbols-light:drag-pan-rounded"
          onClick={() => {}}
          onDragStart={(e) => handleDragStart(e, setLayoutStore, props.item)}
          title="Move"
        />
        <IconButton
          icon="mdi:arrow-up"
          onClick={() => {
            const parentResult = getParentVertex(["Attr"], props.item, graph);
            if (parentResult.error) return;
            onLayoutItemClick(setLayoutStore, parentResult.vertex!.id, graph, setGraph);
          }}
          title="Parent"
        />
        <IconButton
          icon="mage:copy"
          onClick={() =>
            cloneLayoutAndChildren(
              props.item,
              undefined,
              undefined,
              layoutStore.formData.txnId,
              graph,
              setGraph,
              layoutStore.formData.formData,
            )
          }
          title="Duplicate"
        />
        <IconButton
          icon="fluent:save-as-24-regular"
          onClick={() => setShowModal(true)}
          ref={(el) => (saveAsTemplateRef = el)}
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
        <IconButton
          icon="fluent:delete-20-regular"
          onClick={() =>
            deleteLayoutAttr(
              layoutStore,
              setLayoutStore,
              props.item,
              graph,
              setGraph,
              layoutStore.formData.txnId,
              getComponentName(),
              showSuccessToast,
            )
          }
          title="Delete"
        />
      </div>
    </span>
  );
}
