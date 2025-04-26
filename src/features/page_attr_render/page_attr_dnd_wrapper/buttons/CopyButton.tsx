import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import {
  useDesignerLayoutStore,
  useDesignerFormIdContext
} from "~/features/page_designer/context/LayoutContext";
import { useGraph } from "~/lib/graph/GraphContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import type { CssType } from "~/components/form/type/FieldSchemaType";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";

interface CopyButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function CopyButton(props: Readonly<CopyButtonProps>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      css={[
        ICON_BUTTON_STYLES.baseCss,
        ICON_BUTTON_STYLES.defaultCss,
        ...ensureArray(props.css),
        css`
        background-color: transparent;
        border: none;
      `,
      ]}
      icon="ph:copy-simple"
      onClick={(e) => {
        e.stopPropagation();
        
        // If ctrl/cmd key is pressed, perform duplicate action
        if (e.ctrlKey || e.metaKey) {
          cloneLayoutAndChildren(
            props.item,
            undefined,
            undefined,
            formStoreVertex()?.P.txnId,
            graph,
            setGraph,
            graph.vertexes[formStoreVertex()?.P.formDataId || ""] || undefined,
          );
        } else {
          // Regular click - copy to context
          mergeVertexProperties(
            0,
            layoutStoreId,
            graph,
            setGraph,
            { copiedItem: props.item }
          );
        }
      }}
      size={props.size}
      title="Copy (Ctrl+Click to Duplicate)"
    />
  );
} 