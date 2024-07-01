import { Icon } from "@iconify-icon/solid";

import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

export function LeftToggleButton() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <div class={`rel flex jc:start h:50px r:0|15|15|0 p:2 cursor:pointer`}>
      <button
        class="outline:2px|solid|transparent outline:offset|2px:focus cursor:pointer p:15px border-radius:5px flex gap:10px align-items:center"
        onClick={() => setLayoutStore("isLeftOpen", !layoutStore.isLeftOpen)}
      >
        <Icon
          class="cursor:pointer color:#37c"
          height={22}
          icon={"solar:widget-add-outline"}
          width={22}
          />
        <span class={`font:14 cursor:pointer d:none@<sm`}>Add Form Element</span>
      </button>
    </div>
  );
}
