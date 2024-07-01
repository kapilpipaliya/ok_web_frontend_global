import { Icon } from "@iconify-icon/solid";
import { Popover } from "@kobalte/core/popover";
import { type JSX, Match, Show, Switch, createMemo, createSelector, createSignal, onMount, useContext, } from "solid-js";

import { PageRenderVertexContext } from "~/components/page_attr_render/Context";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { handleDragLeave } from "~/components/page_designer/event_handler/handleDragLeave";
import { handleDragOver } from "~/components/page_designer/event_handler/handleDragOver";
import { handleDragOverAndSetDropPosition } from "~/components/page_designer/event_handler/handleDragOverAndSetDropPosition";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { Tooltip } from "~/components/solid_blocks";
import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { submitDataCall } from "~/lib/api/api_functions";
import { iconMap } from "~/lib/constants";
import { IsPreviewContext } from "~/lib/contexts";
import { cloneLayoutAndChildren } from "~/lib/drag_drop/cloneLayoutAndChildren";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { getChildVertex, getParentVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { commitTxn, getNewTxnId } from "~/lib/graph/transaction";

import { DropdownMenu } from "../DropdownMenu";
import { useToast } from "../Toast";
import { useDesignerLayoutStore } from "../page_designer/LayoutContext";

export function PageAttrDnDWrapper(props: Readonly<{ children: JSX.Element; item: Vertex; }>) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useContext(GraphContext)!;
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const [isPreview] = useContext(IsPreviewContext);
  const isSelectedDragOverTargetId = createSelector(() => layoutStore.dragOverTargetId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast, showSuccessToast } = useToast();

  const getComponentName = () => getChildVertex(graph, ["$0Comp"], props.item).vertex?.P.name;
  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.item.id);
  const children = createMemo(() => getChildrenAttrs(graph, setGraph, props.item));

  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);

  const SaveAsTemplateMenu = () => {
    let nameInputRef: HTMLInputElement;
    const [templateName, setTemplateName] = createSignal("");
    const [error, setError] = createSignal("");
    const { showSuccessToast, showWarningToast } = useToast();

    const saveTemplate = async () => {
      const newFormTxnId = getNewTxnId(graph, setGraph);
      const createResult = createForm(graph, setGraph, newFormTxnId, "TemplatePage", { name: templateName() });
      const dataVertex = createResult.vertex!;
      cloneLayoutAndChildren(props.item, dataVertex, newFormTxnId, layoutStore.formData.txnId, graph, setGraph, layoutStore.formData.formData);
      const data = commitTxn(newFormTxnId, graph);

      if (!data) {
        showWarningToast("Internal Server Error");
        return;
      }

      try {
        await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
        showSuccessToast("Template Saved Successfully");
        setShowModal(false);
      } catch (error) {
        setError("An unexpected error occurred");
      }
    };

    const saveAsTemplate = async (name: string) => {
      const res = await checkIfNameExistsMGCall("TemplatePage", name);
      if (res.error) {
        setError(res.message);
        return;
      }
      saveTemplate();
    };

    onMount(() => {
      nameInputRef.focus();
    });

    return (
      <DropdownMenu onMouseLeave={() => setShowModal(false)} parentRef={saveAsTemplateRef as any}>
        Save As Template
        <input onChange={(e) => setTemplateName(e.target.value)} ref={nameInputRef!} type="text" value={templateName()} />
        <Show when={error()}>
          <div style={{ color: 'red' }}>{error()}</div>
        </Show>
        <button disabled={!templateName()} onClick={() => saveAsTemplate(templateName())} type="button">Save</button>
      </DropdownMenu>
    );
  };

  const PropertyDrawer = (props: Readonly<{ itemId: any; }>) => (
    <Show when={isSelectedLayoutId(props.itemId)}>
      <Tooltip content={"Properties"} nowrap>
        <Icon
          class="cursor:pointer flex ai:center"
          height={22}
          icon={"mingcute:settings-5-line"}
          onclick={() => setLayoutStore('showPropertiesDrawer', !layoutStore.showPropertiesDrawer)}
          width={22} />
      </Tooltip>
    </Show>
  );

  const SelectedAttrConfigPopOver = () => (
    <span class="position:relative ">
      <div class="position:absolute color:white bottom:100% flex gap:5px ai:center bg:rgb(37,99,235) r:5px|5px|0px|0px z:50 p:0.25rem ai:center">
        <Tooltip content={"Name"} nowrap>
          <div style={{ display: "flex", "font-size": "0.875rem", "line-height": "1.25rem", "margin-right": "4px" }}>
            {getComponentName()}
          </div>
        </Tooltip>
        <PropertyDrawer itemId={props.item.id} />
        <Tooltip content={"Move"} nowrap>
          <Icon
            class="cursor:pointer flex"
            draggable={true}
            height={20}
            icon={"material-symbols-light:drag-pan-rounded"}
            onDragStart={(e) => handleDragStart(e, setLayoutStore, props.item)}
            width={20} />
        </Tooltip>
        <Tooltip content={"Parent"} nowrap>
          <Icon
            class="cursor:pointer flex"
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
            class="cursor:pointer flex"
            height={20}
            icon={"mage:copy"}
            onClick={() => cloneLayoutAndChildren(props.item, undefined, undefined, layoutStore.formData.txnId, graph, setGraph, layoutStore.formData.formData)}
            width={20} />
        </Tooltip>
        <Tooltip content={"Save as Template"}>
          <Icon
            class="cursor:pointer flex"
            height={20}
            icon={"fluent:save-as-24-regular"}
            onClick={() => setShowModal(true)}
            ref={el => saveAsTemplateRef = el}
            width={20} />
        </Tooltip>
        <Tooltip content={"Delete"}>
          <Icon
            class="cursor:pointer flex"
            height={20}
            icon={"fluent:delete-20-regular"}
            onClick={() => deleteLayoutAttr(layoutStore, setLayoutStore, props.item, graph, setGraph, layoutStore.formData.txnId, getComponentName(), showSuccessToast)}
            width={20} />
        </Tooltip>
        <Show when={showModal()}>
          <SaveAsTemplateMenu />
        </Show>
      </div>
    </span>
  );

  const HoverAttrConfigPopOver = () => (
    <span class="position:relative ">
      <div class="position:absolute color:white bottom:100% flex bg:rgb(37,99,235) r:5px|5px|0px|0px z:50 p:0.25rem ai:center right:0">
        <Icon class="flex" icon={iconMap[getComponentName()]} />
        <Tooltip content={"Name"} nowrap>
          <div class="ml:5px mr:5px f:0.875rem lh:1.25rem">
            {getComponentName()}
          </div>
        </Tooltip>
      </div>
    </span>
  );

  const AttrConfigPopOver = () => (
    <Switch>
      <Match when={isSelectedLayoutId(props.item.id)}>
        <SelectedAttrConfigPopOver />
      </Match>
      <Match when={isSelectedHoverId(props.item.id)}>
        <HoverAttrConfigPopOver />
      </Match>
    </Switch>
  );

  const getBorder = () => {
    if (!isPreview()) {
      if (isActiveTargetItem()) {
        switch (layoutStore.position) {
          case "center":
            return "box-shadow:inset|0|0|0|2px|rgb(0,125,0),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "before":
            return "box-shadow:inset|0|8px|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "after":
            return "box-shadow:inset|0|-8px|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "left":
            return "box-shadow:inset|8px|0|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "right":
            return "box-shadow:inset|-8px|0|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
        }
      }
      if (isSelectedLayoutId(props.item.id) || isSelectedDragOverTargetId(props.item.id)) {
        return "box-shadow:inset|0|0|0|2px|rgb(57,150,225)>*";
      }
      if (isSelectedHoverId(props.item.id)) {
        return "box-shadow:inset|0|0|0|2px|rgb(210,219,252)>*";
      }
    }
  };

  return (
    <PageRenderVertexContext.Provider value={[...useContext(PageRenderVertexContext), props.item]}>
      <button
        class={`contents ${getBorder() || ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onLayoutItemClick(setLayoutStore, props.item, graph, setGraph);
        }}
        onDragEnter={(e) => handleDragOverAndSetDropPosition(e,layoutStore, setLayoutStore, props.item, isPreview(), () => [], children, graph, setGraph, layoutStore.formData.formData)}
        onDragLeave={() => handleDragLeave(setLayoutStore)}
        onDragOver={(e) => handleDragOver(e, layoutStore, setLayoutStore, props.item, isPreview(), () => [], children, graph, setGraph, layoutStore.formData.formData)}
        onDrop={async (e) => {debugger
          await handleDrop(e, layoutStore, graph, showErrorToast, setGraph, layoutStore.formData.txnId, layoutStore.formData.formData);
          resetDragDropState(setLayoutStore);
        }}
        onMouseOver={(e) => {
          e.stopPropagation();
          setLayoutStore('hoverId', props.item.id);
        }}
        onmouseleave={(e) => {
          e.stopPropagation();
          setLayoutStore('hoverId', -1);
        }}
      >
        <Popover open={isSelectedLayoutId(props.item.id) || isSelectedHoverId(props.item.id)} placement={`${isSelectedLayoutId(props.item.id) ? "top-start" : "top-end"}`}>
          <Popover.Anchor>
            {props.children}
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content class="popover__content">
              <AttrConfigPopOver />
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </button>
    </PageRenderVertexContext.Provider>
  );
}
