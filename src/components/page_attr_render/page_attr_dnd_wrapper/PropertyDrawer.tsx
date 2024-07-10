import { Icon } from "@iconify-icon/solid";
import { Show, createSelector } from "solid-js";

import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";

export const PropertyDrawer = (props: Readonly<{ itemId: number | string; }>) => {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  return (
    <Show when={isSelectedLayoutId(props.itemId)}>
      <Tooltip content={"Properties"} nowrap>
        <Icon
          class="flex ai:center cursor:pointer"
          height={22}
          icon={"mingcute:settings-5-line"}
          onclick={() => setLayoutStore('showPropertiesDrawer', !layoutStore.showPropertiesDrawer)}
          width={22} />
      </Tooltip>
    </Show>
  );
};
