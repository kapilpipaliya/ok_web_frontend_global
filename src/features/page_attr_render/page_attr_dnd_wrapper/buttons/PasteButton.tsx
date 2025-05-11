import type { FormStoreObject } from "~/components/form/context/FormContext";
import { Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";
import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface PasteButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function PasteButton(props: Readonly<PasteButtonProps>) {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const layoutStoreId = useDesignerLayoutStore();
  const layoutVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const copiedItem = () => layoutVertex().P.copiedItem;

  return (
    <Show when={copiedItem()}>
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
        icon="ph:clipboard"
        onClick={(e) => {
          e.stopPropagation();
          // Clone the copied item as a child of the current item
          if (copiedItem()) {
            cloneLayoutAndChildren(
              copiedItem()!,
              props.item,
              undefined,
              formStoreVertex()?.P.txnId,
              graph,
              setGraph,
              graph.vertexes[formStoreVertex()?.P.formDataId] || undefined,
            );
          }
        }}
        size={props.size}
        title="Paste"
      />
    </Show>
  );
}
