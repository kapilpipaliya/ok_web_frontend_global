import { createMemo, For, Show, useContext } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "~/components/solid_blocks";
import { FormSettingsContext, HoverIdContext, SelectedCollContext, SelectedComponentContext, SelectedIdContext } from "~/lib/contexts";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { componentDrop } from "~/lib/drag_drop/drop/componentDrop";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { sortChildren } from "~/lib/drag_drop/sortChildren";
import { deleteLayoutGlobal } from "~/lib/drag_drop/event_handler/deleteLayoutGlobal";
import { useToast } from "~/components/Toast";
import { useDesignerLayoutStore } from "../LayoutContext";

export const Stepper = () => {
  const [pageConfigStore] = useDesignerLayoutStore();
  const [formSettings, setFormSettings] = useContext(FormSettingsContext) || [];
  const [graph, setGraph] = useContext(GraphContext)!;

  const steps = createMemo<Vertex[]>(() =>
    getChildrenAttrs(graph, setGraph, pageConfigStore.formData?.formData)
  );

  const [hoverId, setHoverId] = useContext(HoverIdContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [selectedComponent, setSelectedComponent] = useContext(
    SelectedComponentContext,
  );
  const [, setSelectedColl] = useContext(SelectedCollContext);
  const { showErrorToast, showSuccessToast } = useToast();


  const addStepBefore = (toVertex: Vertex) => {
    // add form component
    const formVertex = findVertexByLabelAndUniqueId(
      graph,
      "Comp",
      IdAttr,
      "Form",
    );
    const layoutRowId = componentDrop(
      pageConfigStore.formData.formData,
      pageConfigStore.formData.txnId,
      formVertex!,
      pageConfigStore.formData.formData,
      graph,
      setGraph,
    );


    if (layoutRowId === -1) return;

    const fromVertex = graph.vertexes[layoutRowId];

    sortChildren(
      graph,
      setGraph,
      pageConfigStore.formData.txnId,
      fromVertex,
      pageConfigStore.formData.formData,
      toVertex,
      "before",
    );

    setFormSettings('activeStepId', layoutRowId);
  };

  const addStepAfter = (toVertex: Vertex) => {
    // add form component
    const formVertex = findVertexByLabelAndUniqueId(
      graph,
      "Comp",
      IdAttr,
      "Form",
    );
    const layoutRowId = componentDrop(
      pageConfigStore.formData.formData,
      pageConfigStore.formData.txnId,
      formVertex!,
      pageConfigStore.formData.formData,
      graph,
      setGraph,
    );

    if (layoutRowId === -1) return;

    const fromVertex = graph.vertexes[layoutRowId];

    sortChildren(
      graph,
      setGraph,
      pageConfigStore.formData.txnId,
      fromVertex,
      pageConfigStore.formData.formData,
      toVertex,
      "after",
    );

    setFormSettings('activeStepId', layoutRowId);
  };

  const deleteStep = (item: Vertex) => {
    if (steps().length === 1) {
      showErrorToast("You cannot delete the last step");
      return;
    }
    const currentStep = steps().findIndex(step => step.id === item.id);
    if (currentStep) {
      if (currentStep === 0) {
        setFormSettings('activeStepId', steps()[currentStep + 1].id);
      } else {
        setFormSettings('activeStepId', steps()[currentStep - 1].id);
      }
    }
    deleteLayoutGlobal(selectedId, item, setSelectedId, setSelectedComponent, setSelectedColl, hoverId, setHoverId, graph, setGraph, pageConfigStore.formData.txnId, item.P.name, showSuccessToast);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const fromVertex = steps()[fromIndex];
    const toVertex = steps()[toIndex];
    const position = toIndex < fromIndex ? "before" : "after";
    sortChildren(
      graph,
      setGraph,
      pageConfigStore.formData.txnId,
      fromVertex,
      pageConfigStore.formData.formData!,
      toVertex,
      position
    );
  };

  return (

    <ul style="position:relative; display:flex; flex-direction:row; gap:0.5rem; padding:0.75rem; flex-wrap:wrap" class="w:50%@>md w:100% m:0|10">
      <For each={steps()}>
        {(step, index) => (
          <>
            <Icon
              style="cursor:pointer; color:rgb(37,99,235);padding: 5px 0px;"
              icon="mdi:plus"
              height={20}
              width={20}
              onClick={(e) => {
                e.stopPropagation();
                addStepBefore(step);
              }} />
            <li
              style={`display:flex; align-items:center; gap:0.5rem; flex-shrink:1; flex-basis:0; flex-grow:1; cursor:pointer; ${formSettings.activeStepId === step.id ? "color:rgb(37,99,235);" : ""} position:relative;`}
              onClick={() => setFormSettings('activeStepId', step.id)}
            >
              <span style="display:flex; align-items:center;">
                <Tooltip content={step.P.name}>
                  <span
                    style={`min-width:1.75rem; min-height:1.75rem; width:1.75rem; height:1.75rem; display:flex; justify-content:center; align-items:center; flex-shrink:0; background-color:rgb(243,244,246); font-weight:500; color:rgb(31,41,55); border-radius:9999px; ${formSettings.activeStepId === step.id ? "background-color:rgb(37,99,235); color:white;" : ""}`}
                  >
                    {index() + 1}
                  </span>
                </Tooltip>
              </span>
              <span style="margin-right: 0.5rem; white-space: nowrap;">{step.P.name}</span>
              <div style="width:100%; height:1px; flex-grow:1; background-color:rgb(229,231,235);"></div>
              <button
                style="margin-left:0.5rem; color:red; background:none; border:none; cursor:pointer;"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteStep(step);
                }}
              >
                &times;
              </button>
              <button
                style="margin-left:0.5rem; color:rgb(37,99,235); background:none; border:none; cursor:pointer;"
                onClick={(e) => {
                  e.stopPropagation();
                  if (index() > 0) moveStep(index(), index() - 1);
                }}
              >
                ↑
              </button>
              <button
                style="margin-left:0.5rem; color:rgb(37,99,235); background:none; border:none; cursor:pointer;"
                onClick={(e) => {
                  e.stopPropagation();
                  if (index() < steps().length - 1) moveStep(index(), index() + 1);
                }}
              >
                ↓
              </button>
              <span style="position:absolute; top:100%; left:50%; transform:translateX(-50%); display:none; padding:0.5rem; background:rgba(0, 0, 0, 0.75); color:white; border-radius:0.25rem; font-size:0.75rem; white-space:nowrap; pointer-events:none;">
                {step.P.name}
              </span>
            </li>
            <Show when={index() === steps().length - 1}>
              <Icon
                style={`padding:5px 0px;cursor:pointer; color:rgb(37,99,235);`}
                icon="mdi:plus"
                height={20}
                width={20}
                onClick={(e) => {
                  e.stopPropagation();
                  addStepAfter(step);
                }} />
            </Show>
          </>
        )}
      </For>
    </ul>
  );
};
