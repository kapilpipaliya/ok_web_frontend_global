import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { headerIconButtonCss } from "~/pages/settings/constants";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getOpenedComponentAndPageKeys } from "../../utils/getOpenedComponentAndPageKeys";
import { getExportUrl } from "../../utils/schemaUrl";

export function ExportOpenedButton() {
  const [graph] = useGraph();
  const { showSuccessToast } = useToast();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const openedKeys = () => getOpenedComponentAndPageKeys(graph, layoutStore());
  const hasOpened = () => {
    const { components, pages, functions } = openedKeys();
    return components.length > 0 || pages.length > 0 || functions.length > 0;
  };

  const handleExportOpened = () => {
    const keys = openedKeys();
    const url = getExportUrl(keys);
    window.open(url, "_blank", "noopener,noreferrer");
    showSuccessToast("Export opened in new tab");
  };

  return (
    <IconButton
      css={headerIconButtonCss}
      disabled={!hasOpened()}
      icon="ph:download-simple"
      onClick={hasOpened() ? handleExportOpened : undefined}
      size={22}
      title={
        hasOpened()
          ? "Export opened components, pages, and functions (new tab)"
          : "No opened components, pages, or functions to export"
      }
      tooltipGroup="right-buttons"
    />
  );
}
