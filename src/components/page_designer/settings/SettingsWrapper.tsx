import { useDesignerLayoutStore } from "../LayoutContext";
import { SettingTabs } from "./SettingTabs";

export function SettingsWrapper() {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <aside
      classList={{ "display:none": !layoutStore.isRightOpen }}
    >
      <div
        class={"h:100vh flex-col overflow-x:auto border:1|solid|lightgrey m:5 r:5|5|5|5"}
        style={{
          "max-height": "calc(100vh - 120px)",
          "scrollbar-color": "lightgrey",
          "scrollbar-width": "thin",
        }}
      >
        <SettingTabs />
      </div>
    </aside>
  );
}
