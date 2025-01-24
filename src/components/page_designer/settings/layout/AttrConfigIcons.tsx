import { createSelector, Show } from "solid-js";

import { ImportHtmlButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/ImportHtmlButton";
import { InsertButtons } from "~/components/page_attr_render/page_attr_dnd_wrapper/InsertButtons";
import { SaveAsTemplateButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/SaveAsTemplateButton";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { DuplicateButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/DuplicateButton";
import { DeleteButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/DeleteButton";
import { ParentButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/ParentButton";

export function AttrConfigIcons(props: Readonly<{ metaVertex: Vertex, parentRef: HTMLElement }>) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(() => formStoreVertex()?.P.selectedId);
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const { showSuccessToast } = useToast();

  const iconSize = 32;
  const toggleHidden = (itemId: Id) => {
    const hiddenNodes = formStoreVertex()?.P.hiddenNodes || [];
    const newHiddenNodes = hiddenNodes.includes(itemId)
      ? hiddenNodes.filter((item) => item !== itemId)
      : [...hiddenNodes, itemId];

    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      hiddenNodes: newHiddenNodes
    });
  };

  const getComponent = () =>
    getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.key as string;

  const HideShowIcon = () => {
    const isHiddenAttr = () =>
      (formStoreVertex()?.P.hiddenNodes || []).includes(props.metaVertex.id);
    const icon = () =>
      isHiddenAttr() ? "ph:eye-slash" : "ph:eye";
    const tooltipContent = () => (isHiddenAttr() ? "Show" : "Hide");

    return (
      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon={icon()}
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => toggleHidden(props.metaVertex.id)}
        size={iconSize}
        title={tooltipContent()}
      />
    );
  };

  return (
    <DropdownMenu
      applyDefaultStyles={false}
      placement="right"
      parentRef={props.parentRef}
      useFlip={false}
      offset={-32}
    >
      <div class="flex flex:col ai:center bg:white">
        <Show
          when={
            isSelectedLayoutId(props.metaVertex.id) // ||
            // isSelectedHoverId(props.metaVertex.id)
          }
        >
          <InsertButtons item={props.metaVertex} size={iconSize} />
        </Show>

        <Show
          when={
            isSelectedLayoutId(props.metaVertex.id) ||
            // isSelectedHoverId(props.metaVertex.id) ||
            (formStoreVertex()?.P.hiddenNodes || []).includes(props.metaVertex.id)
          }
        >
          <ParentButton item={props.metaVertex} size={iconSize} />
          <DuplicateButton item={props.metaVertex} size={iconSize} />
          <SaveAsTemplateButton
            item={props.metaVertex}
            size={iconSize}
          />
          <ImportHtmlButton item={props.metaVertex} size={iconSize} />
          <HideShowIcon />
          <DeleteButton componentName={getComponent()} item={props.metaVertex} size={iconSize} class="color:red" />
          &nbsp;
        </Show>
      </div>
    </DropdownMenu>
  );
}
