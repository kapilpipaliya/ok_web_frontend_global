import type { FormStoreObject } from "~/components/form/context/FormContext";

import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext, } from "../../page_designer/context/LayoutContext";

export function DuplicateButton(props: { item: Vertex; size: number }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
      icon="ph:copy"
      iconClass="transition:0.5s|ease-in-out"
      onClick={(e) => {
        e.stopPropagation();
        cloneLayoutAndChildren(
          props.item,
          undefined,
          undefined,
          formStoreVertex()?.P.txnId,
          graph,
          setGraph,
          graph.vertexes[formStoreVertex()?.P.formDataId!],
        )
      }}
      size={props.size}
      title="Duplicate"
    />
  );
}
