import { IconButton } from "~/components/IconButton";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";

export function DuplicateButton(props: { item: Vertex; }) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <IconButton
      class="cursor:pointer"
      icon="mage:copy"
      onClick={() => cloneLayoutAndChildren(
        props.item,
        undefined,
        undefined,
        layoutStore.formData.txnId,
        graph,
        setGraph,
        layoutStore.formData.formData
      )}
      size={20}
      title="Duplicate" />
  );
}
