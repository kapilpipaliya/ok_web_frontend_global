import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { deleteLayoutAttr } from "~/features/page_designer/event_handler/deleteLayoutAttr";
import { useGraph, type Vertex } from "~/lib/graph/graph";

export function DeleteButton(props: {
  class?: string;
  componentName: string;
  item: Vertex;
  size: number;
}) {
  const [graph, setGraph] = useGraph();
  const { showSuccessToast } = useToast();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class={`${props.class} cursor:pointer mr:5px opacity:.5 opacity:1:hover`}
      icon="ph:trash"
      iconClass="transition:0.5s|ease-in-out"
      onClick={(e) => {
        e.stopPropagation();
        deleteLayoutAttr(
          formStoreVertex(),
          props.item,
          graph,
          setGraph,
          formStoreVertex()?.P.txnId,
          props.componentName,
          showSuccessToast,
        );
      }}
      size={props.size}
      title="Delete"
    />
  );
}
