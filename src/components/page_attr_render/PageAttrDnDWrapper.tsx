import { createMemo, createSelector, Match, Show, Switch, useContext, createSignal, onMount, type JSX, } from "solid-js";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { getChildVertex, getParentVertex } from "~/lib/graph/get/sync/traverse";
import { handleDragOver } from "~/components/page_designer/event_handler/handleDragOver";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { handleDragOverAndSetDropPosition } from "~/components/page_designer/event_handler/handleDragOverAndSetDropPosition";
import { handleDragLeave } from "~/components/page_designer/event_handler/handleDragLeave";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { cloneLayoutAndChildren } from "~/lib/drag_drop/cloneLayoutAndChildren";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "~/components/solid_blocks";
import { FormContext, IsPreviewContext } from "~/lib/contexts";
import { Popover } from "@kobalte/core/popover";
import { PageRenderVertexContext } from "~/components/page_attr_render/Context";
import { iconMap } from "~/lib/constants";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { DropdownMenu } from "../DropdownMenu";
import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { commitTxn, getNewTxnId } from "~/lib/graph/transaction";
import { useToast } from "../Toast";
import { submitDataCall } from "~/lib/api/api_functions";
import { deleteLayoutGlobal } from "~/components/page_designer/event_handler/deleteLayoutGlobal";
import { useDesignerLayoutStore } from "../page_designer/LayoutContext";

export function PageAttrDnDWrapper(props: Readonly<{ item: Vertex; children: JSX.Element; }>) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useContext(GraphContext)!;
  const { txnId } = useContext(FormContext);
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const [isPreview] = useContext(IsPreviewContext);
  const [pageConfig, __] = useDesignerLayoutStore();
  const isSelectedDragOverTargetId = createSelector(() => layoutStore.dragOverTargetId);
  const isSelectedHoverId = createSelector(() => pageConfig.hoverId);
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
      const createResult = createForm(graph, setGraph, newFormTxnId, {} as any, "TemplatePage", { name: templateName() });
      const dataVertex = createResult.vertex!;
      cloneLayoutAndChildren(props.item, dataVertex, newFormTxnId, txnId, graph, setGraph, pageConfig.formData.formData);
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
      <DropdownMenu parentRef={saveAsTemplateRef as any} onMouseLeave={() => setShowModal(false)}>
        Save As Template
        <input type="text" value={templateName()} onChange={(e) => setTemplateName(e.target.value)} ref={nameInputRef!} />
        <Show when={error()}>
          <div style={{ color: 'red' }}>{error()}</div>
        </Show>
        <button type="button" disabled={!templateName()} onClick={() => saveAsTemplate(templateName())}>Save</button>
      </DropdownMenu>
    );
  };

  const PropertyDrawer = (props: { itemId: any; }) => (
    <Show when={isSelectedLayoutId(props.itemId)}>
      <Tooltip content={"Properties"} nowrap>
        <Icon
          icon={"mingcute:settings-5-line"}
          onclick={() => setLayoutStore('showPropertiesDrawer', !layoutStore.showPropertiesDrawer)}
          height={22}
          width={22}
          class="cursor:pointer flex ai:center" />
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
            draggable={true}
            onDragStart={(e) => handleDragStart(e, setLayoutStore, props.item)}
            icon={"material-symbols-light:drag-pan-rounded"}
            height={20}
            width={20}
            class="cursor:pointer flex" />
        </Tooltip>
        <Tooltip content={"Parent"} nowrap>
          <Icon
            icon={"mdi:arrow-up"}
            height={20}
            width={20}
            class="cursor:pointer flex"
            onClick={() => {
              const parentResult = getParentVertex(["Attr"], props.item, graph);
              if (parentResult.error) return;
              onLayoutItemClick(setLayoutStore, parentResult.vertex!, graph, setGraph);
            }} />
        </Tooltip>
        <Tooltip content={"Duplicate"}>
          <Icon
            icon={"mage:copy"}
            height={20}
            width={20}
            class="cursor:pointer flex"
            onClick={() => cloneLayoutAndChildren(props.item, undefined, undefined, txnId, graph, setGraph, pageConfig.formData.formData)} />
        </Tooltip>
        <Tooltip content={"Save as Template"}>
          <Icon
            ref={el => saveAsTemplateRef = el}
            icon={"fluent:save-as-24-regular"}
            height={20}
            width={20}
            class="cursor:pointer flex"
            onClick={() => setShowModal(true)} />
        </Tooltip>
        <Tooltip content={"Delete"}>
          <Icon
            onClick={() => deleteLayoutGlobal(layoutStore, setLayoutStore, props.item, graph, setGraph, txnId, getComponentName(), showSuccessToast)}
            icon={"fluent:delete-20-regular"}
            height={20}
            width={20}
            class="cursor:pointer flex" />
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
        <Icon icon={iconMap[getComponentName()]} class="flex" />
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
        onMouseOver={(e) => {
          e.stopPropagation();
          setLayoutStore('hoverId', props.item.id);
        }}
        onmouseleave={(e) => {
          e.stopPropagation();
          setLayoutStore('hoverId', -1);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onLayoutItemClick(setLayoutStore, props.item, graph, setGraph);
        }}
        onDragOver={(e) => handleDragOver(e, layoutStore, setLayoutStore, props.item, isPreview(), () => [], children, graph, setGraph, pageConfig.formData.formData)}
        onDragEnter={(e) => handleDragOverAndSetDropPosition(e,layoutStore, setLayoutStore, props.item, isPreview(), () => [], children, graph, setGraph, pageConfig.formData.formData)}
        onDragLeave={() => handleDragLeave(setLayoutStore)}
        onDrop={async (e) => {
          await handleDrop(e, layoutStore, graph, showErrorToast, setGraph, txnId, pageConfig.formData.formData);
          resetDragDropState(setLayoutStore);
        }}
      >
        <Popover placement={`${isSelectedLayoutId(props.item.id) ? "top-start" : "top-end"}`} open={isSelectedLayoutId(props.item.id) || isSelectedHoverId(props.item.id)}>
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
