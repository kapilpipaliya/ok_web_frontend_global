import { For } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import type { PageLayoutObject } from "../../context/LayoutContext";

import { useDesignerLayoutStore } from "../../context/LayoutContext";

export const MiddleSectionButtons = () => {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  return (
    <For each={["Build", "Setting"]}>
      {(section) => (
        <IconButton
          class={
            "ai:center b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default d:inline-flex f:0.875rem font-weight:600 px:0.75rem py:0.5rem"
          }
          classList={{
            "bg-color:#E0E7F3 bl:none color:#5252F1 r:0|5|5|0":
              section !== "Build",
            "color:grey r:5|0|0|5": section === "Build",
          }}
          icon={section === "Build" ? "ph:hammer" : "ph:gear"}
          onclick={() =>
            mergeVertexProperties<PageLayoutObject>(
              0,
              layoutStoreId,
              graph,
              setGraph,
              {
                selectedSection: section.toLowerCase(),
              },
            )
          }
          size={22}
          title={section}
        />
      )}
    </For>
  );
};
