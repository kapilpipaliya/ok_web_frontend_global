
import { For } from "solid-js";

import { IconButton } from "~/components/IconButton";

import { useDesignerLayoutStore } from "../../LayoutContext";

export const MiddleSectionButtons = () => {
  const [_, setLayoutStore] = useDesignerLayoutStore();
  return (
    <For each={["Build", "Setting"]}>
      {(section) => (

          <IconButton
            class={`ai:center b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default d:inline-flex f:0.875rem font-weight:600 px:0.75rem py:0.5rem`}
            classList={{
              "bg-color:#E0E7F3 bl:none color:#5252F1 r:0|5|5|0": section !== "Build",
              "color:grey r:5|0|0|5": section === "Build",
            }}
            icon={
              section === "Build"
                ? "material-symbols-light:build-circle-outline-rounded"
                : "solar:settings-linear"
            }
            onclick={() => setLayoutStore("selectedSection", section.toLowerCase())}
            size={22}
            title={section}
          >
          </IconButton>
     
      )}
    </For>
  );
};
