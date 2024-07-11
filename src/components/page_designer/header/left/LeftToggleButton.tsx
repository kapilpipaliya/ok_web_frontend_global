import { Icon } from "@iconify-icon/solid";

import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

export function LeftToggleButton() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <button
      class="flex align-items:center border-radius:5px gap:10px outline:2px|solid|transparent outline:offset|2px:focus"
      onClick={() => setLayoutStore("isLeftOpen", !layoutStore.isLeftOpen)}
    >
      <Icon
        class="color:#37c cursor:pointer"
        height={22}
        icon={"solar:widget-add-outline"}
        width={22}
      />
      <span class={`cursor:pointer d:none@<sm font:14`}>Add Form Element</span>
    </button>
  );
}
