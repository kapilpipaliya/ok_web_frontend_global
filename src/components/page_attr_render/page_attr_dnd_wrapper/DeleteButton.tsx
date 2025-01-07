import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { useToast } from "../../styled/Toast";
import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function DeleteButton(props: {
  componentName: string;
  item: Vertex;
}) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const { showSuccessToast } = useToast();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class="cursor:pointer"
      icon="fluent:delete-20-regular"
      onClick={() =>
        deleteLayoutAttr(
          layoutStoreId,
          props.item,
          graph,
          setGraph,
          formStoreVertex()?.P.txnId,
          props.componentName,
          showSuccessToast,
        )
      }
      size={20}
      title="Delete"
    />
  );
}
