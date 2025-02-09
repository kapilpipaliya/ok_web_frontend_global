import type { FormStoreObject } from "~/components/form/context/FormContext";

import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { IconButton } from "~/components/styled/IconButton";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../../page_designer/context/LayoutContext";

export function ParentButton(props: { item: Vertex; size: number }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
      icon="ph:arrow-up"
      iconClass="transition:0.5s|ease-in-out"
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
      title="Parent"
    />
  );
}
