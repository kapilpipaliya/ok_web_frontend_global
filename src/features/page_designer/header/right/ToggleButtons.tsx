import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import {
  INITIAL_WIDTHS,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import {headerIconButtonClass} from "~/pages/settings/constants";

export function ToggleButtons() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  const togglePanel = (
    panel: "isLeftOpen" | "isRight0Open" | "isRight1Open" | "isRight2Open",
  ) => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      [panel]: !layoutStore()[panel],
    });
  };

  const resetLayout = () => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      isLeftOpen: true,
      isRight0Open: true,
      isRight1Open: true,
      isRight2Open: true,
      leftWidth: INITIAL_WIDTHS.left,
      rightWidth0: INITIAL_WIDTHS.right0,
      rightWidth1: INITIAL_WIDTHS.right1,
      rightWidth2: INITIAL_WIDTHS.right2,
    });
  };

  return (
    <>
      <IconButton
        class={`${headerIconButtonClass}`}
        icon="ph:squares-four"
        iconClass={`${layoutStore().isLeftOpen ? "color:#37c" : "color:gray-60"}`}
        onClick={() => togglePanel("isLeftOpen")}
        size={22}
        title="Toggle Elements Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        class={`${headerIconButtonClass}`}
        icon="ph:robot"
        iconClass={`${layoutStore().isRight0Open ? "color:#37c" : "color:gray-60"}`}
        onClick={() => togglePanel("isRight0Open")}
        size={22}
        title="Toggle AI Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        class={`${headerIconButtonClass}`}
        icon="ph:sliders"
        iconClass={`${layoutStore().isRight1Open ? "color:#37c" : "color:gray-60"}`}
        onClick={() => togglePanel("isRight1Open")}
        size={22}
        title="Toggle Properties Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        class={`${headerIconButtonClass}`}
        icon="ph:gear"
        iconClass={`${layoutStore().isRight2Open ? "color:#37c" : "color:gray-60"}`}
        onClick={() => togglePanel("isRight2Open")}
        size={22}
        title="Toggle Settings Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        class={headerIconButtonClass}
        icon="ph:arrows-counter-clockwise"
        onClick={resetLayout}
        size={22}
        title="Reset Layout"
        tooltipGroup="right-buttons"
      />
    </>
  );
}
