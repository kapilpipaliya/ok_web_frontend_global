import { useGraph } from "~/lib/graph/graph";

import type { PageLayoutObject } from "../context/LayoutContext";

import { useDesignerLayoutStore } from "../context/LayoutContext";
import { SettingTabs } from "./SettingTabs";
import {STYLES} from "~/pages/settings/constants";

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
        class={`border:1|solid|lightgrey flex:column ${STYLES.overflow} p:5 r:5|5|5|5`}
      >
        <SettingTabs />
      </div>
    </aside>
  );
}
