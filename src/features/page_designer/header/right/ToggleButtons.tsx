import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";

import {
  getInitialLayoutSettings,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { css } from "~/lib/styles";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

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
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      getInitialLayoutSettings(),
    );
  };

  return (
    <>
      <IconButton
        css={headerIconButtonCss}
        icon="ph:squares-four"
        iconCss={css`${layoutStore().isLeftOpen ? "color:#37c" : "color:gray"};`}
        onClick={() => togglePanel("isLeftOpen")}
        size={22}
        title="Toggle Elements Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        css={headerIconButtonCss}
        icon="ph:robot"
        iconCss={css`${layoutStore().isRight0Open ? "color:#37c" : "color:gray"};`}
        onClick={() => togglePanel("isRight0Open")}
        size={22}
        title="Toggle AI Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        css={headerIconButtonCss}
        icon="ph:sliders"
        iconCss={css`${layoutStore().isRight1Open ? "color:#37c" : "color:gray"};`}
        onClick={() => togglePanel("isRight1Open")}
        size={22}
        title="Toggle Properties Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        css={headerIconButtonCss}
        icon="ph:gear"
        iconCss={css`${layoutStore().isRight2Open ? "color:#37c" : "color:gray"};`}
        onClick={() => togglePanel("isRight2Open")}
        size={22}
        title="Toggle Settings Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        css={headerIconButtonCss}
        icon="ph:arrows-counter-clockwise"
        onClick={resetLayout}
        size={22}
        title="Reset Layout"
        tooltipGroup="right-buttons"
      />
    </>
  );
}
