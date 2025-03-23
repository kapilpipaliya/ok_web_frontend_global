import { type Setter, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { Drawer } from "~/components/styled/modal/Drawer";
import { FormElementTabs } from "~/features/page_designer/form_elements/FormElementTabs";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";

export function FormElements() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  return (
    <Show
      fallback={
        <ZIndex>
          <Drawer
            customButton={() => false}
            drawerClass={"padding:10px"}
            open={() => layoutStore().isLeftOpen}
            setIsOpen={
              ((v: boolean) =>
                mergeVertexProperties<PageLayoutObject>(
                  0,
                  layoutStoreId,
                  graph,
                  setGraph,
                  { isLeftOpen: v },
                )) as Setter<boolean>
            }
            width="75%"
          >
            <FormElementTabs />
          </Drawer>
        </ZIndex>
      }
      when={!layoutStore().isSmallScreen}
    >
      <Show when={layoutStore().isLeftOpen}>
        <FormElementTabs />
      </Show>
    </Show>
  );
}
