import { For } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { css } from "~/lib/styles";

export const MiddleSectionButtons = () => {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  return (
    <For each={["Build", "Setting"]}>
      {(section) => (
        <IconButton
          css={[
            css`
              align-items: center;
              border: 1px solid lightgrey;
              color: rgb(17, 24, 39);
              cursor: default;
              display: inline-flex;
              font-size: 0.875rem;
              font-weight: 600;
              padding: 0.75rem 0.5rem;
            `,
            css`
              background-color: #E0E7F3;
              border-left: none;
              color: #5252F1;
              border-radius: 0 0.5rem 0.5rem 0;
            `,
          ]}
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
