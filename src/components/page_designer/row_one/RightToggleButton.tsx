import { Icon } from "@iconify-icon/solid";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

export function RightToggleButton() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <div class={`rel flex jc:end h:50px r:0|15|15|0 p:2 cursor:pointer`}>
      <button
        style={{
          cursor: "pointer",
          padding: "15px",
          'border-radius': "5px",
          display: "flex",
          gap: "10px",
          'align-items': "center",
        }}
        onClick={() => setLayoutStore("isRightOpen", !layoutStore.isRightOpen)}
        class="p:15 jc:center outline:2px|solid|transparent outline:offset|2px:focus"
      >
        <span class="font:14 cursor:pointer d:none@<sm ml:10 ">View Form Settings</span>
        <Icon
          icon={"icon-park-outline:setting-two"}
          height={22}
          class="cursor:pointer"
          width={22}
          style={{ color: "#37c" }} />
      </button>
    </div>
  );
}
