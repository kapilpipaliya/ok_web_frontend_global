import { useDesignerLayoutStore } from "../LayoutContext";
import { SettingTabs } from "./SettingTabs";

export function SettingsWrapper() {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <aside
      classList={{ "display:none": !layoutStore.isRightOpen }}
    >
      <div
        class={"scrollbar-color:lightgrey scrollbar-width:thin border:1|solid|lightgrey flex:column h:100vh m:5 max-height:calc(100vh-70px) overflow-x:auto r:5|5|5|5"}
      >
        <SettingTabs />
      </div>
    </aside>
  );
}
