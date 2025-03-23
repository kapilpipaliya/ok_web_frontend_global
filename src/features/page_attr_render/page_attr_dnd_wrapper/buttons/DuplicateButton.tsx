import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";
import { useGraph } from "~/lib/graph/GraphContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

interface DuplicateButtonProps {
  item: Vertex;
  size: number;
}

export function DuplicateButton(props: Readonly<DuplicateButtonProps>) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default}`}
      icon="ph:copy"
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
        );
      }}
      size={props.size}
      title="Duplicate"
    />
  );
}
