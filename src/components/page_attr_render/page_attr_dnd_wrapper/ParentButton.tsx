import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { IconButton } from "~/components/styled/IconButton";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext, useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function ParentButton(props: { item: Vertex }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

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
          formStoreVertex()!,
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
