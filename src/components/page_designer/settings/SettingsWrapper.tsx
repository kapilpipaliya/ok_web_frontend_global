import { useDesignerLayoutStore } from "../LayoutContext";
import { SettingTabs } from "./SettingTabs";

export function SettingsWrapper() {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <aside
      classList={{ "display:none": !layoutStore.isRightOpen }}
    >
      <div
        class={"flex-col border:1|solid|lightgrey h:100vh m:5 overflow-x:auto r:5|5|5|5"}
        style={{
          "max-height": "calc(100vh - 70px)",
          "scrollbar-color": "lightgrey",
          "scrollbar-width": "thin",
        }}
      >
        <SettingTabs />
      </div>
    </aside>
  );
}
