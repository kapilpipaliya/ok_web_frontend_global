import { FormStoreObject } from "~/components/form/context/FormContext";
import { IconButton } from "~/components/styled/IconButton";
import { type Vertex, useGraph, type Id, GraphInterface } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { SetStoreFunction } from "solid-js/store";

export function toggleHidden(itemId: Id, formStoreId: Id, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const hiddenNodes = formStoreVertex()?.P.hiddenNodes || [];
  const newHiddenNodes = hiddenNodes.includes(itemId)
    ? hiddenNodes.filter((item) => item !== itemId)
    : [...hiddenNodes, itemId];

  mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
    hiddenNodes: newHiddenNodes
  });
}

export function HideShowIcon(props: { metaVertex: Vertex; iconSize: number; }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isHiddenAttr = () => (formStoreVertex()?.P.hiddenNodes || []).includes(props.metaVertex.id);
  const icon = () => isHiddenAttr() ? "ph:eye-slash" : "ph:eye";
  const tooltipContent = () => (isHiddenAttr() ? "Show" : "Hide");

  return (
    <IconButton
      class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
      icon={icon()}
      iconClass="transition:0.5s|ease-in-out"
      onClick={(e) => {
        e.stopPropagation();
        toggleHidden(props.metaVertex.id, formStoreId!, graph, setGraph);
      }}
      size={props.iconSize}
      title={tooltipContent()} />
  );
}
