import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { IconButton } from "~/components/styled/IconButton";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";

export function ParentButton(props: { item: Vertex }) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P;
  const formStoreVertex = () => graph.vertexes[layoutStore().formStore[0]];

  return (
    <IconButton
      class="cursor:pointer"
      icon="mdi:arrow-up"
      onClick={() => {
        const parentResult = getParentVertex(["Attr"], props.item, graph);
        if (parentResult.error) {
          return;
        }
        onLayoutItemClick(
          layoutStoreId,
          parentResult.vertex!.id,
          graph,
          setGraph,
        );
      }}
      size={20}
      title="Parent"
    />
  );
}
