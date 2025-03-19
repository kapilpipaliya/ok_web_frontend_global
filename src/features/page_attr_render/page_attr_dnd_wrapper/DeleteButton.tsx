import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { deleteLayoutAttr } from "~/features/page_designer/event_handler/deleteLayoutAttr";
import { useGraph } from "~/lib/graph/GraphContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

interface DeleteButtonProps {
  class?: string;
  componentName: string;
  item: Vertex;
  size: number;
}

export function DeleteButton(props: Readonly<DeleteButtonProps>) {
  const [graph, setGraph] = useGraph();
  const { showSuccessToast } = useToast();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.delete} ${props.class ?? ""}`}
      icon="ph:trash"
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
      title={`Delete ${props.componentName}`}
    />
  );
}
