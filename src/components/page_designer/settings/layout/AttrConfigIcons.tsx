import { Icon } from "@iconify-icon/solid";
import { Show, createSelector } from "solid-js";

import { useToast } from "~/components/Toast";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";

const RenderButton = (props: { additionalClasses?: string; icon: string; onClick: () => void; title: string }) => (
  <button
    class={`${props.additionalClasses ?? ""} flex ai:center cursor:pointer mr:5px opacity:.5 opacity:1:hover`}
    onClick={props.onClick}
    title={props.title}
  >
    <Icon class="transition: 0.5s ease-in-out;" height={18} icon={props.icon} width={18} />
  </button>
);

export function AttrConfigIcons(props: Readonly<{ metaVertex: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showSuccessToast } = useToast();

  const toggleHidden = (itemId: Id) => {
    setLayoutStore("hiddenNodes", (prev) =>
      prev.includes(itemId) ? prev.filter((item) => item !== itemId) : [...prev, itemId]
    );
  };

  const getComponent = () => getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.name as string;

  const HideShowIcon = () => {
    const isHidden = () => layoutStore.hiddenNodes.includes(props.metaVertex.id);
    const icon = () => (isHidden() ? "mdi:eye-off-outline" : "mdi:eye-outline");
    const tooltipContent = () => (isHidden() ? "Show" : "Hide");

    return (
      <RenderButton
        icon={icon()}
        onClick={() => toggleHidden(props.metaVertex.id)}
        title={tooltipContent()}
      />
    );
  };


  return (
    <div class="flex ai:center">
      <Show when={isSelectedLayoutId(props.metaVertex.id) || isSelectedHoverId(props.metaVertex.id)}>
        <RenderButton
          icon="mingcute:settings-5-line"
          onClick={() => {
            setLayoutStore("showPropertiesDrawer", !layoutStore.showPropertiesDrawer);
          }}
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
        <RenderButton
          icon="mage:copy"
          onClick={() => {
            cloneLayoutAndChildren(
              props.metaVertex,
              undefined,
              undefined,
              layoutStore.formData.txnId,
              graph,
              setGraph,
              layoutStore.formData.formData
            );
          }}
          title="Duplicate"
        />

        <HideShowIcon />

        <RenderButton
          additionalClasses="color:red"
          icon="mage:trash"
          onClick={() => {
            deleteLayoutAttr(
              layoutStore,
              setLayoutStore,
              props.metaVertex,
              graph,
              setGraph,
              layoutStore.formData.txnId,
              getComponent(),
              showSuccessToast
            );
          }}
          title="Delete"
        />

        &nbsp;
      </Show>
      {/* </Show> */}
    </div>
  );
}
