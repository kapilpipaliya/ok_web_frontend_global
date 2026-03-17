import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { headerIconButtonCss } from "~/pages/settings/constants";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getOpenedComponentAndPageKeys } from "../../utils/getOpenedComponentAndPageKeys";
import { getImportUrl } from "../../utils/schemaUrl";

const IMPORT_CONFIRM_MESSAGE =
  "Import will replace the selected components and pages in the database. Continue?";

export function ImportOpenedButton() {
  const [graph] = useGraph();
  const { showSuccessToast } = useToast();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const openedKeys = () => getOpenedComponentAndPageKeys(graph, layoutStore());
  const hasOpened = () => {
    const { components, pages } = openedKeys();
    return components.length > 0 || pages.length > 0;
  };

  const handleImportOpened = () => {
    if (!window.confirm(IMPORT_CONFIRM_MESSAGE)) return;
    const keys = openedKeys();
    const url = getImportUrl(keys);
    window.open(url, "_blank", "noopener,noreferrer");
    showSuccessToast("Import opened in new tab");
  };

  return (
    <IconButton
      css={headerIconButtonCss}
      disabled={!hasOpened()}
      icon="ph:upload-simple"
      onClick={hasOpened() ? handleImportOpened : undefined}
      size={22}
      title={
        hasOpened()
          ? "Import opened components and pages from file (new tab)"
          : "No opened components or pages to import"
      }
      tooltipGroup="right-buttons"
    />
  );
}
