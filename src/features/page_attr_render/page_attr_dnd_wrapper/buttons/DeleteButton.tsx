import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { useDesignerFormIdContext, useDesignerLayoutStore } from "~/features/page_designer/context/LayoutContext";
import { deleteLayoutAttr } from "~/features/page_designer/functions/layout/deleteLayoutAttr";
import { useGraph } from "~/lib/graph/GraphContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import type { CssType } from "~/components/form/type/FieldSchemaType";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

interface DeleteButtonProps {
  css?: CssType;
  componentName: string;
  item: Vertex;
  size: number;
}

export function DeleteButton(props: Readonly<DeleteButtonProps>) {
  const [graph, setGraph] = useGraph();
  const { showSuccessToast } = useToast();

  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      css={[
        ICON_BUTTON_STYLES.baseCss,
        ICON_BUTTON_STYLES.deleteCss,
        ...ensureArray(props.css),
        css`
        color: \${args.theme.var.color.error};
        background-color: transparent;
        border: none;
      `,
      ]}
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
          layoutStoreId
        );
      }}
      size={props.size}
      title={`Delete ${props.componentName}`}
    />
  );
}
