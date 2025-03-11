import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import {
  type GraphInterface,
  type Id,
  useGraph,
  type Vertex,
} from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import {ICON_BUTTON_STYLES} from "~/pages/settings/constants";

import { useDesignerFormIdContext } from "../../context/LayoutContext";

export function HideShowIcon(props: { iconSize: number; metaVertex: Vertex }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isHiddenAttr = () =>
    (formStoreVertex()?.P.hiddenNodes || []).includes(props.metaVertex.id);
  const icon = () => (isHiddenAttr() ? "ph:eye-slash" : "ph:eye");
  const tooltipContent = () => (isHiddenAttr() ? "Show" : "Hide");

  return (
    <IconButton
      class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default} ${ICON_BUTTON_STYLES.spacing}`}
      icon={icon()}
      iconClass="transition:transform|0.2s"
      onClick={(e) => {
        e.stopPropagation();
        toggleHidden(props.metaVertex.id, formStoreId!, graph, setGraph);
      }}
      size={props.iconSize}
      title={tooltipContent()}
    />
  );
}

export function toggleHidden(
  itemId: Id,
  formStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const hiddenNodes = formStoreVertex()?.P.hiddenNodes || [];
  const newHiddenNodes = hiddenNodes.includes(itemId)
    ? hiddenNodes.filter((item) => item !== itemId)
    : [...hiddenNodes, itemId];

  mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
    hiddenNodes: newHiddenNodes,
  });
}
