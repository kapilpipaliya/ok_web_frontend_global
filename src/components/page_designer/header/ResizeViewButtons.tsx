import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";

import { useDesignerLayoutStore } from "../LayoutContext";

export const ResizeViewButtons = () => {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const views = [
    { icon: true, key: "prime:mobile", value: "Mobile" },
    { icon: true, key: "uil:tablet", value: "Tablet" },
    { icon: true, key: "humbleicons:desktop", value: "Desktop" },
  ];
  return (
    <For each={views}>
      {(view, index) => (
        <Tooltip content={view.value} position={"s"}>
          <button
            class={`${index() === 0 ? "r:5|0|0|5" : index() === 2 ? "r:0|5|5|0" : ""} rel ai:center b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default d:inline-flex f:0.875rem font-weight:600 px:0.75rem py:0.5rem z:10:focus`}
            onclick={() => setLayoutStore("view", view.value)}
            style={{
              "background-color": view.value === layoutStore.view ? "#E0E7F3" : "",
              color: view.value === layoutStore.view ? "#5252F1" : "grey",
            }}
            type="button"
          >
            <Icon height={22} icon={view.key} width={22} />
          </button>
        </Tooltip>
      )}
    </For>
  );
};
