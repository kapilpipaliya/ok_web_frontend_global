import { Icon } from "@iconify-icon/solid";
import { For, Show, createMemo } from "solid-js";

import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { Step } from "./Step";
import { addStepAfter } from "./addStepAfter";
import { addStepBefore } from "./addStepBefore";

export function FormStepper() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const steps = createMemo<Vertex[]>(() =>
    getChildrenAttrs(graph, setGraph, layoutStore.formStore[0].formData),
  );

  const handleAddStepBefore = (e: MouseEvent, step: Vertex) => {
    e.stopPropagation();
    addStepBefore(graph, setGraph, layoutStore, setLayoutStore, layoutStore.formStore[0].formData, step);
  };

  const handleAddStepAfter = (e: MouseEvent, step: Vertex) => {
    e.stopPropagation();
    addStepAfter(graph, setGraph, layoutStore, setLayoutStore, layoutStore.formStore[0].formData, step);
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
