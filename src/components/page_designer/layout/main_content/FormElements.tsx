import { Show, type Setter } from "solid-js";
import { ZIndex } from "~/components/fields/ZIndex";
import { Drawer } from "~/components/styled/Drawer";
import { useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";
import { FormElementsWrapper } from "../../form_elements/FormElementsWrapper";

export function FormElements() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  return (
    <Show
      fallback={<ZIndex>
        <Drawer
          customButton={() => false}
          drawerClass={"padding:10px"}
          open={() => layoutStore().isLeftOpen}
          setIsOpen={((v: boolean) => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isLeftOpen: v })) as Setter<boolean>}
          width="75%"
        >
          <FormElementsWrapper />
        </Drawer>
      </ZIndex>}
      when={!layoutStore().isSmallScreen}
    >
      <Show when={layoutStore().isLeftOpen}>
        <FormElementsWrapper />
      </Show>
    </Show>
  );
}
