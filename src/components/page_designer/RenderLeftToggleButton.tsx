import { Icon } from "@iconify-icon/solid";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

export function RenderLeftToggleButton() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <div class={`rel flex jc:start h:50px r:0|15|15|0 p:2 cursor:pointer`}>
      <button
        style={{
          cursor: "pointer",
          padding: "15px",
          'border-radius': "5px",
          display: "flex",
          gap: "10px",
          'align-items': "center",
        }}
        onClick={() => setLayoutStore("isLeftOpen", !layoutStore.isLeftOpen)}
        class="outline:2px|solid|transparent outline:offset|2px:focus"
      >
        <Icon
          icon={"solar:widget-add-outline"}
          height={22}
          class="cursor:pointer"
          width={22}
          style={{ color: "#37c" }} />
        <span class={`font:14 cursor:pointer d:none@<sm`}>Add Form Element</span>
      </button>
    </div>
  );
}
