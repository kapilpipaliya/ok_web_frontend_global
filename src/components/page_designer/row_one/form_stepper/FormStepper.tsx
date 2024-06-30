import { createMemo, For, Show, useContext } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { addStepBefore } from "./addStepBefore";
import { addStepAfter } from "./addStepAfter";
import { Step } from "./Step";

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
    <div style="position:relative; display:flex; flex-direction:row; gap:0.5rem; padding:0.75rem; flex-wrap:wrap" class="w:50%@>md w:100% m:0|10">
      <For each={steps()}>
        {(step, index) => (
          <>
            <Icon
              style="cursor:pointer; color:rgb(37,99,235);padding: 5px 0px;"
              icon="mdi:plus"
              height={20}
              width={20}
              onClick={(e) => handleAddStepBefore(e, step)}
            />
            <Step
              step={step}
              index={index}
              steps={steps()}
            />
            <Show when={index() === steps().length - 1}>
              <Icon
                style={`padding:5px 0px;cursor:pointer; color:rgb(37,99,235);`}
                icon="mdi:plus"
                height={20}
                width={20}
                onClick={(e) => handleAddStepAfter(e, step)}
              />
            </Show>
          </>
        )}
      </For>
    </div>
  );
}
