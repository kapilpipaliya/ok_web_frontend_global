import { useGraph, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { PageLayoutObject, useDesignerFormIdContext } from "../context/LayoutContext";

import { useDesignerLayoutStore } from "../context/LayoutContext";
import { SettingTabs } from "./SettingTabs";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";

export function SettingsWrapper() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  return (
    <aside
      classList={{
        "display:none": !layoutStore().isRightOpen,
      }}
    >
      <div
        class={`scrollbar-color:lightgrey {scrollbar-width:thin} border:1|solid|lightgrey flex:column h:100vh max-height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 2}px) overflow:auto p:5 r:5|5|5|5`}
      >
        <SettingTabs />
      </div>
    </aside>
  );
}
