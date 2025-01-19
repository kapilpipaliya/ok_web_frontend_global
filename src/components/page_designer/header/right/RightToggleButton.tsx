import { IconButton } from "~/components/styled/IconButton";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { useDesignerFormIdContext, useDesignerLayoutStore } from "../../context/LayoutContext";
import { PageLayoutObject } from "../../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function RightToggleButton() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  return (
    <IconButton
      class="border-radius:5px cursor:pointer gap:10px jc:center outline:2px|solid|transparent outline:offset|2px:focus"
      icon="icon-park-outline:setting-two"
      onClick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isRightOpen: !layoutStore().isRightOpen })}
      size={22}
    />
  );
}
