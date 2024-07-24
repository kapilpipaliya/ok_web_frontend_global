
import { IconButton } from "~/components/IconButton";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function RightToggleButton() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <IconButton
      class="border-radius:5px cursor:pointer gap:10px jc:center outline:2px|solid|transparent outline:offset|2px:focus"
      icon="icon-park-outline:setting-two"
      onClick={() => setLayoutStore("isRightOpen", !layoutStore.isRightOpen)}
      size={22}
    />
  );
}
