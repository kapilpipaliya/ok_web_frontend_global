import { For } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { DIMENSIONS } from "~/components/styled/ResizableDivView";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export const ResizeViewButtons = (props: {
  formStoreId: string;
  openIndex: number;
}) => {
  const [graph, setGraph] = useGraph();
  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const openedView = () => formStoreVertex()?.P.openedViews[props.openIndex];
  const viewVertex = () =>
    graph.vertexes[openedView()] as Vertex<{ view: string }>;
  return (
    <div class="flex">
      <For each={Object.values(DIMENSIONS)}>
        {(view, index) => (
          <IconButton
            class="b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default f:0.875rem font-weight:600 px:0.75rem py:0.5rem"
            classList={{
              "bg:#E0E7F3": view.id === viewVertex()?.P.view?.toLowerCase(),
              "bl:none": index() !== 0,
              "color:#5252F1": view.id === viewVertex()?.P.view?.toLowerCase(),
              "color:grey": view.id !== viewVertex()?.P.view?.toLowerCase(),
              "r:0|5|5|0": index() === 2,
              "r:5|0|0|5": index() === 0,
            }}
            icon={view.icon}
            onclick={() => {
              mergeVertexProperties(0, openedView(), graph, setGraph, {
                view: view.id,
              });
            }}
            size={22}
            title={view.id}
          />
        )}
      </For>
    </div>
  );
};
