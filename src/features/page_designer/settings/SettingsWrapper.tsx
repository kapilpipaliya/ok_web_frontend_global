import { useGraph } from "~/lib/graph/graph";
import { STYLES } from "~/pages/settings/constants";

import type { PageLayoutObject } from "../context/LayoutContext";

import { useDesignerLayoutStore } from "../context/LayoutContext";
import { SettingTabs } from "./SettingTabs";

export function SettingsWrapper() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const _layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  return (
    <aside
    // classList={{
    //   "display:none": !layoutStore().isRightOpen,
    // }}
    >
      <div
        class={`px:2`}
      >
        <SettingTabs />
      </div>
    </aside>
  );
}
