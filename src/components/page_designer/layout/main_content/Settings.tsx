import { Show, type Setter } from "solid-js";
import { ZIndex } from "~/components/fields/ZIndex";
import { Drawer } from "~/components/styled/Drawer";
import { useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";
import { SettingsWrapper } from "../../settings/SettingsWrapper";

export function Settings() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  return (
    <Show
      fallback={<ZIndex>
        <Drawer
          customButton={() => false}
          drawerClass={"padding:10px"}
          open={() => layoutStore().isRightOpen}
          setIsOpen={((isOpen: boolean) => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isRightOpen: isOpen })) as Setter<boolean>}
          width="75%"
        >
          <SettingsWrapper />
        </Drawer>
      </ZIndex>}
      when={!layoutStore().isSmallScreen}
    >
      <SettingsWrapper />
    </Show>
  );
}
