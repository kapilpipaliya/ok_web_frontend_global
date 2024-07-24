
import { IconButton } from "~/components/IconButton";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

export function LeftToggleButton() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <IconButton
      class="border-radius:5px gap:10px outline-offset:2px:focus outline:2px|solid|transparent"
      icon="solar:widget-add-outline"
      iconCss="color:#37c cursor:pointer"
      onClick={() => setLayoutStore("isLeftOpen", !layoutStore.isLeftOpen)}
      size={22}
    >
      <span class="cursor:pointer d:none@<sm font:14">Add Form Element</span>
    </IconButton>
  );
}
