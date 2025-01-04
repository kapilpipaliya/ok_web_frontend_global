import { For } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";

import { PageLayoutObject, useDesignerLayoutStore } from "../../context/LayoutContext";
import { useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export const ResizeViewButtons = () => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  const views = [
    { icon: true, key: "prime:mobile", value: "Mobile" },
    { icon: true, key: "uil:tablet", value: "Tablet" },
    { icon: true, key: "humbleicons:desktop", value: "Desktop" },
  ];
  return (
    <div>
      <For each={views}>
        {(view, index) => (
          <IconButton
            class="b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default f:0.875rem font-weight:600 px:0.75rem py:0.5rem"
            classList={{
              "bg:#E0E7F3": view.value === layoutStore().view,
              "bl:none": index() !== 0,
              "color:#5252F1": view.value === layoutStore().view,
              "color:grey": view.value !== layoutStore().view,
              "r:0|5|5|0": index() === 2,
              "r:5|0|0|5": index() === 0,
            }}
            icon={view.key}
            onclick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { view: view.value })}
            size={22}
            title={view.value}
          />
        )}
      </For>
    </div>
  );
};
