import { createSignal, For, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "~/components/solid_blocks";

export const Stepper = () => {
  const [steps, setSteps] = createSignal([
    { id: 1, label: "Personal Info", icon: "1" },
    { id: 2, label: "Account Info", icon: "2" },
    { id: 3, label: "Review", icon: "3" },
  ]);
  const [currentStep, setCurrentStep] = createSignal(1);

  const updateIndices = (newSteps: any) => {
    return newSteps.map((step: any, index: any) => ({
      ...step,
      id: index + 1,
      label: `Step ${index + 1}`,
      icon: `${index + 1}`
    }));
  };

  const addStepBefore = (id: any) => {
    const newStepId = steps().length + 1;
    const newSteps: any = [];
    steps().forEach(step => {
      if (step.id === id) {
        newSteps.push({ id: newStepId, label: `Step ${newStepId}`, icon: `${newStepId}` });
      }
      newSteps.push(step);
    });
    setSteps(updateIndices(newSteps));
  };

  const addStepAfter = (id: any) => {
    const newStepId = steps().length + 1;
    const newSteps: any = [];
    steps().forEach(step => {
      newSteps.push(step);
      if (step.id === id) {
        newSteps.push({ id: newStepId, label: `Step ${newStepId}`, icon: `${newStepId}` });
      }
    });
    setSteps(updateIndices(newSteps));
  };

  const deleteStep = (id: any) => {
    const newSteps: any = steps().filter(step => step.id !== id);
    setSteps(updateIndices(newSteps));
    if (currentStep() === id) {
      // If the current step is deleted, set the current step to the first step
      setCurrentStep(newSteps.length > 0 ? newSteps[0].id : null);
    }
  };

  return (
    <>
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
                  addStepBefore(step.id);
                }} />
              <li
                style={`display:flex; align-items:center; gap:0.5rem; flex-shrink:1; flex-basis:0; flex-grow:1; cursor:pointer; ${currentStep() === step.id ? "color:rgb(37,99,235);" : ""} position:relative;`}
                onClick={() => setCurrentStep(step.id)}
              >
                <span style="display:flex; align-items:center;">
                  <Tooltip content={step.label}>
                    <span
                      style={`min-width:1.75rem; min-height:1.75rem; width:1.75rem; height:1.75rem; display:flex; justify-content:center; align-items:center; flex-shrink:0; background-color:rgb(243,244,246); font-weight:500; color:rgb(31,41,55); border-radius:9999px; ${currentStep() === step.id ? "background-color:rgb(37,99,235); color:white;" : ""}`}
                    >
                      {step.icon}
                    </span>
                  </Tooltip>
                </span>
                <span style="margin-right: 0.5rem; white-space: nowrap;">{step.label}</span>
                <div style="width:100%; height:1px; flex-grow:1; background-color:rgb(229,231,235);"></div>
                <button
                  style="margin-left:0.5rem; color:red; background:none; border:none; cursor:pointer;"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStep(step.id);
                  }}
                >
                  &times;
                </button>
                <span style="position:absolute; top:100%; left:50%; transform:translateX(-50%); display:none; padding:0.5rem; background:rgba(0, 0, 0, 0.75); color:white; border-radius:0.25rem; font-size:0.75rem; white-space:nowrap; pointer-events:none;">
                  {step.label}
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
                    addStepAfter(step.id);
                  }} />
              </Show>
            </>
          )}
        </For>
      </ul>
    </>
  );
};
