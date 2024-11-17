import { IconButton } from "~/components/styled/IconButton";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";

export function DuplicateButton(props: { item: Vertex }) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <IconButton
      class="cursor:pointer"
      icon="mage:copy"
      onClick={() =>
        cloneLayoutAndChildren(
          props.item,
          undefined,
          undefined,
          layoutStore.formStore[0].txnId,
          graph,
          setGraph,
          layoutStore.formStore[0].formData!,
        )
      }
      size={20}
      title="Duplicate"
    />
  );
}
