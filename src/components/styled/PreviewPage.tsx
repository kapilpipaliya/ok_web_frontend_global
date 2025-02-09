import { createSignal, For, type JSX, onCleanup } from "solid-js";

import { useGraph } from "~/lib/graph/graph";
import { createViewVertex } from "~/lib/graph/mutate/createViewVertex";
import { deleteVertex } from "~/lib/graph/mutate/vertex";

import { IconButton } from "./IconButton";
import { DIMENSIONS, ResizableContainer } from "./ResizableDivView";

export const PreviewPage = (props: Readonly<{ children: JSX.Element }>) => {
  const [view, setView] = createSignal(DIMENSIONS.desktop);
  const [graph, setGraph] = useGraph();
  const viewVertexObject = createViewVertex(
    { view: "Desktop" },
    graph,
    setGraph,
  );
  onCleanup(() => {
    deleteVertex(0, viewVertexObject.id, graph, setGraph);
  });

  return (
    <div class="flex ai:center bg:gray-100 flex:col min-h:100vh p:5|20">
      <div class="flex mb:16">
        <For each={Object.values(DIMENSIONS)}>
          {(viewData, index) => (
            <IconButton
              classList={{
                "bg:#E0E7F3 color:#5252F1": viewData.id === view().id,
                "color:grey": viewData.id !== view().id,
                "r:0|5|5|0": index() === 2,
                "r:5|0|0|5": index() === 0,
                "rel b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default f:0.875rem font-weight:600 px:0.75rem py:0.5rem": true,
              }}
              icon={viewData.icon}
              onclick={() => setView(viewData)}
              size={22}
              title={viewData.id}
            />
          )}
        </For>
      </div>
      <div class="flex ai:center h:full jc:center w:full">
        <ResizableContainer view={viewVertexObject.id}>
          {props.children}
        </ResizableContainer>
      </div>
    </div>
  );
};
