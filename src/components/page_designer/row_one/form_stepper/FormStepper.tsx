import { Icon } from "@iconify-icon/solid";
import { For, Show, createMemo, useContext } from "solid-js";

import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { GraphContext, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { Step } from "./Step";
import { addStepAfter } from "./addStepAfter";
import { addStepBefore } from "./addStepBefore";

export function FormStepper() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useContext(GraphContext)!;
  const steps = createMemo<Vertex[]>(() => getChildrenAttrs(graph, setGraph, layoutStore.formData?.formData));

  const handleAddStepBefore = (e: MouseEvent, step: Vertex) => {
    e.stopPropagation();
    addStepBefore(graph, setGraph, layoutStore, setLayoutStore, step);
  };

  const handleAddStepAfter = (e: MouseEvent, step: Vertex) => {
    e.stopPropagation();
    addStepAfter(graph, setGraph, layoutStore, setLayoutStore, step);
  };

  return (
    <div class="m:0|10 w:100% w:50%@>md" style="position:relative; display:flex; flex-direction:row; gap:0.5rem; padding:0.75rem; flex-wrap:wrap">
      <For each={steps()}>
        {(step, index) => (
          <>
            <Icon
              height={20}
              icon="mdi:plus"
              onClick={(e) => handleAddStepBefore(e, step)}
              style="cursor:pointer; color:rgb(37,99,235);padding: 5px 0px;"
              width={20}
            />
            <Step
              index={index}
              step={step}
              steps={steps()}
            />
            <Show when={index() === steps().length - 1}>
              <Icon
                height={20}
                icon="mdi:plus"
                onClick={(e) => handleAddStepAfter(e, step)}
                style={`padding:5px 0px;cursor:pointer; color:rgb(37,99,235);`}
                width={20}
              />
            </Show>
          </>
        )}
      </For>
    </div>
  );
}
