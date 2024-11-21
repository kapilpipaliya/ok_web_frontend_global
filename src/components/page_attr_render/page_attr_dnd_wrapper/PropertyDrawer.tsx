import { Icon } from "@iconify-icon/solid";
import { createSelector, Show } from "solid-js";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";

// DEPRECATED, Delete this file
export const PropertyDrawer = (
  props: Readonly<{ itemId: number | string }>,
) => {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  return (
    <Show when={isSelectedLayoutId(props.itemId)}>
      <Icon
        class="flex ai:center cursor:pointer"
        height={22}
        icon={"mingcute:settings-5-line"}
        onclick={() =>
          setLayoutStore(
            "showPropertiesDrawer",
            !layoutStore.showPropertiesDrawer,
          )
        }
        title="Properties"
        width={22}
      />
    </Show>
  );
};
