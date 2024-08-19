import { createSelector, Show } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { ImportHtmlButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/ImportHtmlButton";
import { SaveAsTemplateButton } from "~/components/page_attr_render/page_attr_dnd_wrapper/SaveAsTemplateButton";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { useToast } from "~/components/Toast";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function AttrConfigIcons(props: Readonly<{ metaVertex: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showSuccessToast } = useToast();

  const toggleHidden = (itemId: Id) => {
    setLayoutStore("hiddenNodes", (prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  };

  const getComponent = () =>
    getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P
      .name as string;

  const HideShowIcon = () => {
    const isHiddenAttr = () =>
      layoutStore.hiddenNodes.includes(props.metaVertex.id);
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
        <IconButton
          class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
          icon="mingcute:settings-5-line"
          iconClass="transition:0.5s|ease-in-out"
          onClick={() => {
            setLayoutStore(
              "showPropertiesDrawer",
              !layoutStore.showPropertiesDrawer,
            );
          }}
          size={18}
          title="Properties"
        />
      </Show>

      {/* <Show when={!rootVertexes().includes(props.metaVertex)}> */}
      <Show
        when={
          isSelectedLayoutId(props.metaVertex.id) ||
          isSelectedHoverId(props.metaVertex.id) ||
          layoutStore.hiddenNodes.includes(props.metaVertex.id)
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
              layoutStore.formStore[0].txnId,
              graph,
              setGraph,
              layoutStore.formStore[0].formData,
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
              layoutStore,
              setLayoutStore,
              props.metaVertex,
              graph,
              setGraph,
              layoutStore.formStore[0].txnId,
              getComponent(),
              showSuccessToast,
            );
          }}
          size={18}
          title="Delete"
        />
        &nbsp;
      </Show>
      {/* </Show> */}
    </div>
  );
}
