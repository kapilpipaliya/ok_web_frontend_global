import { Icon } from "@iconify-icon/solid";
import { createMemo, For, Show } from "solid-js";

import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext, useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { addStepAfter } from "./addStepAfter";
import { addStepBefore } from "./addStepBefore";
import { Step } from "./Step";
import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";
import type { FormStoreObject } from "../context/FormContext";

export function FormStepper() {
  const formStoreId = useDesignerFormIdContext();
  const [graph, setGraph] = useGraph();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const formDataId = () => formStoreVertex()?.P?.formDataId;

  const steps = createMemo<Vertex[]>(() =>
    getChildrenAttrs(graph, setGraph, graph.vertexes[formDataId()!]),
  );

  const handleAddStepBefore = (e: MouseEvent, step: Vertex) => {
    e.stopPropagation();
    addStepBefore(
      graph,
      setGraph,
      formStoreVertex(),
      graph.vertexes[formDataId()!],
      step,
    );
  };

  const handleAddStepAfter = (e: MouseEvent, step: Vertex) => {
    e.stopPropagation();
    addStepAfter(
      graph,
      setGraph,
      formStoreVertex()!,
      graph.vertexes[formDataId()!],
      step,
    );
  };

  return (
    <div class="flex flex:row flex:wrap gap:0.5rem m:0|10 p:0.75rem position:relative w:100% w:50%@>md">
      <For each={steps()}>
        {(step, index) => (
          <>
            <Icon
              class="cursor-pointer color:rgb(37,99,235) px:0 py:5px"
              height={20}
              icon="mdi:plus"
              onClick={(e) => handleAddStepBefore(e, step)}
              width={20}
            />
            <Step index={index} step={step} steps={steps()} />
            <Show when={index() === steps().length - 1}>
              <Icon
                class="cursor-pointer color:rgb(37,99,235) px:0 py:5px"
                height={20}
                icon="mdi:plus"
                onClick={(e) => handleAddStepAfter(e, step)}
                width={20}
              />
            </Show>
          </>
        )}
      </For>
    </div>
  );
}
