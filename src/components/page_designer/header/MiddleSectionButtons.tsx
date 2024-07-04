import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";

import { useDesignerLayoutStore } from "../LayoutContext";

export const MiddleSectionButtons = () => {
  const [_, setLayoutStore] = useDesignerLayoutStore();
  return (
    <For each={["Build", "Setting"]}>
      {(section) => (
        <Tooltip content={section} position={"s"}>
          <button
            class={`${section === "Build" ? "r:5|0|0|5" : "r:0|5|5|0"} rel ai:center b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default d:inline-flex f:0.875rem font-weight:600 px:0.75rem py:0.5rem`}
            onclick={() => setLayoutStore("selectedSection", section.toLowerCase())}
            style={{
              "background-color": section === "Build" ? "" : "#E0E7F3",
              color: section === "Build" ? "grey" : "#5252F1",
            }}
            type="button"
          >
            <Icon
              height={22}
              icon={section === "Build"
                ? "material-symbols-light:build-circle-outline-rounded"
                : "solar:settings-linear"}
              width={22} />
          </button>
        </Tooltip>
      )}
    </For>
  );
};
