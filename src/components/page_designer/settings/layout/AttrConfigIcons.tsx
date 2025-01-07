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

import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function AttrConfigIcons(props: Readonly<{ metaVertex: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  
  const isSelectedLayoutId = createSelector(() => formStoreVertex()?.P.selectedId);
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const { showSuccessToast } = useToast();

  const toggleHidden = (itemId: Id) => {
    const hiddenNodes = formStoreVertex()?.P.hiddenNodes || [];
    const newHiddenNodes = hiddenNodes.includes(itemId)
      ? hiddenNodes.filter((item) => item !== itemId)
      : [...hiddenNodes, itemId];
      
    mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, {
      hiddenNodes: newHiddenNodes
    });
  };

  const getComponent = () =>
    getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.key as string;

  const HideShowIcon = () => {
    const isHiddenAttr = () =>
      (formStoreVertex()?.P.hiddenNodes || []).includes(props.metaVertex.id);
    const icon = () =>
      isHiddenAttr() ? "mdi:eye-off-outline" : "mdi:eye-outline";
    const tooltipContent = () => (isHiddenAttr() ? "Show" : "Hide");

    return (
      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon={icon()}
        iconClass="transition:0.5s|ease-in-out"
        onClick={() => toggleHidden(props.metaVertex.id)}
        size={18}
        title={tooltipContent()}
      />
    );
  };

  return (
    <div class="flex ai:center">
      <Show
        when={
          isSelectedLayoutId(props.metaVertex.id) ||
          isSelectedHoverId(props.metaVertex.id)
        }
      >
        <InsertButtons item={props.metaVertex} />
      </Show>

      <Show
        when={
          isSelectedLayoutId(props.metaVertex.id) ||
          isSelectedHoverId(props.metaVertex.id) ||
          (formStoreVertex()?.P.hiddenNodes || []).includes(props.metaVertex.id)
        }
      >
        <IconButton
          class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
          icon="mage:copy"
          iconClass="transition:0.5s|ease-in-out"
          onClick={() => {
            cloneLayoutAndChildren(
              props.metaVertex,
              undefined,
              undefined,
              formStoreVertex()?.P.txnId,
              graph,
              setGraph,
              graph.vertexes[formStoreVertex()?.P.formDataId!],
            );
          }}
          size={18}
          title="Duplicate"
        />
        <SaveAsTemplateButton
          class="mr:5px opacity:.5 opacity:1:hover"
          item={props.metaVertex}
          size={20}
        />
        <ImportHtmlButton
          class="mr:5px opacity:.5 opacity:1:hover"
          item={props.metaVertex}
          size={20}
        />
        <HideShowIcon />
        <IconButton
          class="color:red cursor:pointer mr:5px opacity:.5 opacity:1:hover"
          icon="mage:trash"
          iconClass="transition:0.5s|ease-in-out"
          onClick={() => {
            deleteLayoutAttr(
              layoutStoreId,
              props.metaVertex,
              graph,
              setGraph,
              formStoreVertex()?.P.txnId,
              getComponent(),
              showSuccessToast,
            );
          }}
          size={18}
          title="Delete"
        />
        &nbsp;
      </Show>
    </div>
  );
}
