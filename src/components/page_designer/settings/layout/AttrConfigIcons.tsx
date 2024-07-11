import { Icon } from "@iconify-icon/solid";
import { Show, createSelector } from "solid-js";

import { useToast } from "~/components/Toast";
import { GenericField } from "~/components/fields/GenericField";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function AttrConfigIcons(props: { metaVertex: Vertex }) {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showSuccessToast } = useToast();

  function toggleHidden(itemId: Id) {
    setLayoutStore("hiddenNodes", (prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }

  const getComponent = () =>
    getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P
      .name as string;

  const HideShowIcon = () => {
    const isHidden = () =>
      layoutStore.hiddenNodes.includes(props.metaVertex.id);
    const icon = () => (isHidden() ? "mdi:eye-off-outline" : "mdi:eye-outline");
    const tooltipContent = () => (isHidden() ? "Show" : "Hide");

    return (
      <Tooltip content={tooltipContent()} nowrap>
        <button
          class="opacity:.5 opacity:1:hover"
          onClick={(e) => {
            e.stopPropagation();
            toggleHidden(props.metaVertex.id);
          }}
        >
          <Icon
            class="transition: 0.5s ease-in-out;"
            height={18}
            icon={icon()}
            width={18}
          />
        </button>
      </Tooltip>
    );
  };
  return (
    <div class="flex ai:center mt:4">
      <Show
        when={
          isSelectedLayoutId(props.metaVertex.id) ||
          isSelectedHoverId(props.metaVertex.id)
        }
      >
        <Tooltip content={"Properties"} nowrap>
          <Icon
            class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
            height={22}
            icon={"mingcute:settings-5-line"}
            onclick={() =>
              setLayoutStore(
                "showPropertiesDrawer",
                !layoutStore.showPropertiesDrawer,
              )
            }
            width={22}
          />
        </Tooltip>
      </Show>

      {/* <Show when={!rootVertexes().includes(props.metaVertex)}> */}
      <Show
        when={
          isSelectedLayoutId(props.metaVertex.id) ||
          isSelectedHoverId(props.metaVertex.id) ||
          layoutStore.hiddenNodes.includes(props.metaVertex.id)
        }
      >
        <Tooltip content={"Duplicate"} nowrap>
          <Icon
            class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
            color={"black"}
            height={18}
            icon={"mage:copy"}
            onclick={() => {
              cloneLayoutAndChildren(
                props.metaVertex,
                undefined,
                undefined,
                layoutStore.formData.txnId,
                graph,
                setGraph,
                layoutStore.formData.formData,
              );
            }}
            width={18}
          />
        </Tooltip>
        <HideShowIcon />
        <Tooltip content={"Delete"} nowrap>
          <GenericField
            meta={
              {
                P: {
                  class: "cursor:pointer  mr:5px opacity:.5 opacity:1:hover",
                  component: "Icon",
                  height: 18,
                  icon: "mage:trash",
                  onClick: () => {
                    deleteLayoutAttr(
                      layoutStore,
                      setLayoutStore,
                      props.metaVertex,
                      graph,
                      setGraph,
                      layoutStore.formData.txnId,
                      getComponent(),
                      showSuccessToast,
                    );
                  },
                  style: { color: "red" },
                  width: 18,
                },
              } as any
            }
          />
        </Tooltip>
        &nbsp;
      </Show>
      {/* </Show> */}
    </div>
  );
}
