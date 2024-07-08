import { type Accessor, createMemo } from "solid-js";

import { useToast } from "~/components/Toast";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { Tooltip } from "~/components/solid_blocks";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { deleteStep } from "./deleteStep";
import { moveStep } from "./moveStep";

export function Step(props: Readonly<{ index: Accessor<number>; step: Vertex; steps: Vertex[]; }>) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  const steps = createMemo<Vertex[]>(() => getChildrenAttrs(graph, setGraph, layoutStore.formData?.formData));

  const handleDelete = (e: MouseEvent) => {
    deleteStep(graph, setGraph, layoutStore, setLayoutStore, props.steps, props.step, showErrorToast, showSuccessToast);
  };

  const handleMoveUp = (e: MouseEvent) => {
    if (props.index() > 0) moveStep(graph, setGraph, layoutStore, setLayoutStore, props.steps, props.index(), props.index() - 1);
  };

  const handleMoveDown = (e: MouseEvent) => {
    if (props.index() < steps().length - 1) moveStep(graph, setGraph, layoutStore, setLayoutStore, props.steps, props.index(), props.index() + 1);
  };

  // const isActiveStep = () => layoutStore.activeStepId === props.step.id;
  // Todo: Fix this:
  const isActiveStep = () => false;

  return (
    <div
      style={`display:flex; align-items:center; gap:0.5rem; flex-shrink:1; flex-basis:0; flex-grow:1; cursor:pointer; ${isActiveStep() ? "color:rgb(37,99,235);" : ""} position:relative;`}
    >
      <button class="flex align-items:center; gap:0.5rem; width:100%" onClick={() => setLayoutStore('activeStepId', props.step.id)} type="button">
        <span style="display:flex; align-items:center;">
          <Tooltip content={props.step.P.name}>
            <span
              style={`min-width:1.75rem; min-height:1.75rem; width:1.75rem; height:1.75rem; display:flex; justify-content:center; align-items:center; flex-shrink:0; background-color:rgb(243,244,246); font-weight:500; color:rgb(31,41,55); border-radius:9999px; ${isActiveStep ? "background-color:rgb(37,99,235); color:white;" : ""}`}
            >
              {props.index() + 1}
            </span>
          </Tooltip>
        </span>
        <span style="margin-right: 0.5rem; white-space: nowrap;">{props.step.P.name}</span>
        <div style="width:100%; height:1px; flex-grow:1; background-color:rgb(229,231,235);"></div>
      </button>

      <button
        onClick={handleDelete}
        style="margin-left:0.5rem; color:red; background:none; border:none; cursor:pointer;"
      >
        &times;
      </button>
      <button
        onClick={handleMoveUp}
        style="margin-left:0.5rem; color:rgb(37,99,235); background:none; border:none; cursor:pointer;"
      >
        ↑
      </button>
      <button
        onClick={handleMoveDown}
        style="margin-left:0.5rem; color:rgb(37,99,235); background:none; border:none; cursor:pointer;"
      >
        ↓
      </button>
      <span style="position:absolute; top:100%; left:50%; transform:translateX(-50%); display:none; padding:0.5rem; background:rgba(0, 0, 0, 0.75); color:white; border-radius:0.25rem; font-size:0.75rem; white-space:nowrap; pointer-events:none;">
        {props.step.P.name}
      </span>
    </div>
  );
}
