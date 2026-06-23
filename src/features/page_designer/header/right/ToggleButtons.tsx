import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";

import {
  getInitialLayoutSettings,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function ToggleButtons() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  const togglePanel = (
    panel:
      | "isComponentsOpen"
      | "isAiOpen"
      | "isPropertiesOpen"
      | "isSettingsOpen",
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
        iconCss={`return \`._id {${layoutStore().isComponentsOpen ? "color:${args.theme.var.color.primary}" : "color:${args.theme.var.color.text_light_300}"};}\`;`}
        onClick={() => togglePanel("isComponentsOpen")}
        size={22}
        title="Toggle Elements Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        css={headerIconButtonCss}
        icon="ph:robot"
        iconCss={`return \`._id {${layoutStore().isAiOpen ? "color:${args.theme.var.color.primary}" : "color:${args.theme.var.color.text_light_300}"};}\`;`}
        onClick={() => togglePanel("isAiOpen")}
        size={22}
        title="Toggle AI Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        css={headerIconButtonCss}
        icon="ph:sliders"
        iconCss={`return \`._id {${layoutStore().isPropertiesOpen ? "color:${args.theme.var.color.primary}" : "color:${args.theme.var.color.text_light_300}"};}\`;`}
        onClick={() => togglePanel("isPropertiesOpen")}
        size={22}
        title="Toggle Properties Panel"
        tooltipGroup="right-buttons"
      />
      <IconButton
        css={headerIconButtonCss}
        icon="ph:gear"
        iconCss={`return \`._id {${layoutStore().isSettingsOpen ? "color:${args.theme.var.color.primary}" : "color:${args.theme.var.color.text_light_300}"};}\`;`}
        onClick={() => togglePanel("isSettingsOpen")}
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
