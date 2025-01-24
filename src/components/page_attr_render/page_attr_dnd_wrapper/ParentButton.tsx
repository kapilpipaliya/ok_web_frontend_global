import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { IconButton } from "~/components/styled/IconButton";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext, useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function ParentButton(props: { item: Vertex; size: number }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
      icon="ph:arrow-up"
      iconClass="transition:0.5s|ease-in-out"
      onClick={(e) => {
        e.stopPropagation();
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
      size={props.size}
      title="Parent"
    />
  );
}
