import { IconButton } from "~/components/styled/IconButton";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";

export function ParentButton(props: { item: Vertex }) {
  const [graph, setGraph] = useGraph();
  const [, setLayoutStore] = useDesignerLayoutStore();
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
          setLayoutStore,
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
