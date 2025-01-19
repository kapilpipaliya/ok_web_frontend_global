import { useDesignerFormIdContext, useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageLayoutObject } from "../../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function LeftToggleButton() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      class="border-radius:5px gap:10px outline-offset:2px:focus outline:2px|solid|transparent"
      icon="solar:widget-add-outline"
      iconClass="color:#37c cursor:pointer"
      onClick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isLeftOpen: !layoutStore().isLeftOpen })}
      size={22}
    >
      <span class="cursor:pointer d:none@<sm font:14">Add Form Element</span>
    </IconButton>
  );
}
