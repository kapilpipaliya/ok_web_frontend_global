import { IconButton } from "~/components/IconButton";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useToast } from "../../Toast";
import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";

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
      onClick={() => deleteLayoutAttr(
        layoutStore,
        setLayoutStore,
        props.item,
        graph,
        setGraph,
        layoutStore.formData.txnId,
        props.componentName,
        showSuccessToast
      )}
      size={20}
      title="Delete" />
  );
}
