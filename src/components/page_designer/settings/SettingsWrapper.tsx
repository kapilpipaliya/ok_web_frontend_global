import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../LayoutContext";
import { SettingTabs } from "./SettingTabs";

export function SettingsWrapper() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  return (
    <aside classList={{ 
      "display:none": !layoutStore.isRightOpen,
     }}>
      <div
        class={`scrollbar-color:lightgrey scrollbar-width:thin border:1|solid|lightgrey flex:column h:100vh max-height:calc(100vh-${graph.navBarHeight + 2}px) overflow-x:auto p:5 r:5|5|5|5`}
      >
        <SettingTabs />
      </div>
    </aside>
  );
}
