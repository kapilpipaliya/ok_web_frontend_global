import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph } from "~/lib/graph/GraphContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { CssType } from "~/components/form/type/FieldSchemaType";
interface ParentButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function ParentButton(props: Readonly<ParentButtonProps>) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      css={[ICON_BUTTON_STYLES.baseCss, ICON_BUTTON_STYLES.defaultCss, ...ensureArray(props.css),
        css`
          background-color: transparent;
          border: none;
        `,
      ]}
      icon="ph:arrow-up"
      onClick={(e) => {
        e.stopPropagation();
        const parentResult = evalExpression("<-Attr", {
          graph,
          vertexes: [props.item],
        });
        if (!parentResult?.[0]) {
          return;
        }
        onLayoutItemClick(
          layoutStoreVertex(),
          formStoreVertex()!,
          parentResult[0].id,
          graph,
          setGraph,
        );
      }}
      size={props.size}
      title="Select Parent"
    />
  );
}
