import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import { useDesignerLayoutStore } from "../LayoutContext";

export const ResizeViewButtons = () => {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const views = [
    { key: "prime:mobile", value: "Mobile", icon: true },
    { key: "uil:tablet", value: "Tablet", icon: true },
    { key: "humbleicons:desktop", value: "Desktop", icon: true },
  ];
  return (
    <For each={views}>
      {(view, index) => (
        <Tooltip content={view.value} position={"s"}>
          <button
            style={{
              "background-color": view.value === layoutStore.view ? "#E0E7F3" : "",
              color: view.value === layoutStore.view ? "#5252F1" : "grey",
            }}
            onclick={() => setLayoutStore("view", view.value)}
            type="button"
            class={`rel d:inline-flex ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus ${index() === 0 ? "r:5|0|0|5" : index() === 2 ? "r:0|5|5|0" : ""}`}
          >
            <Icon icon={view.key} height={22} width={22} />
          </button>
        </Tooltip>
      )}
    </For>
  );
};
