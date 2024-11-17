import { IconButton } from "~/components/styled/IconButton";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { useToast } from "../../styled/Toast";

export function DeleteButton(props: {
  componentName: string;
  item: Vertex;
}) {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const { showSuccessToast } = useToast();
  return (
    <IconButton
      class="cursor:pointer"
      icon="fluent:delete-20-regular"
      onClick={() =>
        deleteLayoutAttr(
          layoutStore,
          setLayoutStore,
          props.item,
          graph,
          setGraph,
          layoutStore.formStore[0].txnId,
          props.componentName,
          showSuccessToast,
        )
      }
      size={20}
      title="Delete"
    />
  );
}
