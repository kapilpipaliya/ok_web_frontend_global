import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext, useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function DuplicateButton(props: { item: Vertex }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class="cursor:pointer"
      icon="mage:copy"
      onClick={() =>
        cloneLayoutAndChildren(
          props.item,
          undefined,
          undefined,
          formStoreVertex()?.P.txnId,
          graph,
          setGraph,
          graph.vertexes[formStoreVertex()?.P.formDataId!],
        )
      }
      size={20}
      title="Duplicate"
    />
  );
}
