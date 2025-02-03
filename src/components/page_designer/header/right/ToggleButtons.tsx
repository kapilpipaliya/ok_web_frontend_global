import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";

export function ToggleButtons() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  const togglePanel = (panel: 'isLeftOpen' | 'isRight0Open' | 'isRight1Open' | 'isRight2Open') => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      [panel]: !layoutStore()[panel]
    });
  };

  return (
    <div class="flex ai:center gap:2 mr:3">
      <IconButton
        class="border-radius:5px cursor:pointer"
        icon="ph:squares-four"
        iconClass={`${layoutStore().isLeftOpen ? 'color:#37c' : 'color:gray-60'}`}
        onClick={() => togglePanel('isLeftOpen')}
        size={22}
        title="Toggle Elements Panel" />
      <IconButton
        class="border-radius:5px cursor:pointer"
        icon="ph:robot"
        iconClass={`${layoutStore().isRight0Open ? 'color:#37c' : 'color:gray-60'}`}
        onClick={() => togglePanel('isRight0Open')}
        size={22}
        title="Toggle AI Panel" />
      <IconButton
        class="border-radius:5px cursor:pointer"
        icon="ph:sliders"
        iconClass={`${layoutStore().isRight1Open ? 'color:#37c' : 'color:gray-60'}`}
        onClick={() => togglePanel('isRight1Open')}
        size={22}
        title="Toggle Properties Panel" />
      <IconButton
        class="border-radius:5px cursor:pointer"
        icon="ph:gear"
        iconClass={`${layoutStore().isRight2Open ? 'color:#37c' : 'color:gray-60'}`}
        onClick={() => togglePanel('isRight2Open')}
        size={22}
        title="Toggle Settings Panel" />
    </div>
  );
}
