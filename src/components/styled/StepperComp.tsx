import { Icon } from "@iconify-icon/solid";
import { createSignal, For, Show } from "solid-js";

export const Stepper = () => {
  const [steps, setSteps] = createSignal([
    { icon: "1", id: 1, label: "Personal Info" },
    { icon: "2", id: 2, label: "Account Info" },
    { icon: "3", id: 3, label: "Review" },
  ]);
  const [currentStep, setCurrentStep] = createSignal(1);

  const updateIndices = (newSteps: any) => {
    return newSteps.map((step: any, index: any) => ({
      ...step,
      icon: `${index + 1}`,
      id: index + 1,
      label: `Step ${index + 1}`,
    }));
  };

  const addStepBefore = (id: any) => {
    const newStepId = steps().length + 1;
    const newSteps: any = [];
    steps().forEach((step) => {
      if (step.id === id) {
        newSteps.push({
          icon: `${newStepId}`,
          id: newStepId,
          label: `Step ${newStepId}`,
        });
      }
      newSteps.push(step);
    });
    setSteps(updateIndices(newSteps));
  };

  const addStepAfter = (id: any) => {
    const newStepId = steps().length + 1;
    const newSteps: any = [];
    steps().forEach((step) => {
      newSteps.push(step);
      if (step.id === id) {
        newSteps.push({
          icon: `${newStepId}`,
          id: newStepId,
          label: `Step ${newStepId}`,
        });
      }
    });
    setSteps(updateIndices(newSteps));
  };

  const deleteStep = (id: any) => {
    const newSteps: any = steps().filter((step) => step.id !== id);
    setSteps(updateIndices(newSteps));
    if (currentStep() === id) {
      // If the current step is deleted, set the current step to the first step
      setCurrentStep(newSteps.length > 0 ? newSteps[0].id : null);
    }
  };

  return (
    <>
      <ul
        class="m:0|10 w:100% w:50%@>md"
        style="position:relative; display:flex; flex-direction:row; gap:0.5rem; padding:0.75rem; flex-wrap:wrap"
      >
        <For each={steps()}>
          {(step, index) => (
            <>
              <Icon
                height={20}
                icon="mdi:plus"
                noobserver
                onClick={(e) => {
                  e.stopPropagation();
                  addStepBefore(step.id);
                }}
                style="cursor:pointer; color:rgb(37,99,235);padding: 5px 0px;"
                width={20}
              />
              <li
                onClick={() => setCurrentStep(step.id)}
                style={`display:flex; align-items:center; gap:0.5rem; flex-shrink:1; flex-basis:0; flex-grow:1; cursor:pointer; ${currentStep() === step.id ? "color:rgb(37,99,235);" : ""} position:relative;`}
              >
                <span style="display:flex; align-items:center;">
                  <span
                    style={`min-width:1.75rem; min-height:1.75rem; width:1.75rem; height:1.75rem; display:flex; justify-content:center; align-items:center; flex-shrink:0; background-color:rgb(243,244,246); font-weight:500; color:rgb(31,41,55); border-radius:9999px; ${currentStep() === step.id ? "background-color:rgb(37,99,235); color:base-5;" : ""}`}
                    title={step.label}
                  >
                    {step.icon}
                  </span>
                </span>
                <span style="margin-right: 0.5rem; white-space: nowrap;">
                  {step.label}
                </span>
                <div style="width:100%; height:1px; flex-grow:1; background-color:rgb(229,231,235);" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStep(step.id);
                  }}
                  style="margin-left:0.5rem; color:error; background:none; border:none; cursor:pointer;"
                >
                  &times;
                </button>
                <span style="position:absolute; top:100%; left:50%; transform:translateX(-50%); display:none; padding:0.5rem; background:rgba(0, 0, 0, 0.75); color:base-5; border-radius:0.25rem; font-size:0.75rem; white-space:nowrap; pointer-events:none;">
                  {step.label}
                </span>
              </li>
              <Show when={index() === steps().length - 1}>
                <Icon
                  height={20}
                  icon="mdi:plus"
                  noobserver
                  onClick={(e) => {
                    e.stopPropagation();
                    addStepAfter(step.id);
                  }}
                  style={
                    "padding:5px 0px;cursor:pointer; color:rgb(37,99,235);"
                  }
                  width={20}
                />
              </Show>
            </>
          )}
        </For>
      </ul>
    </>
  );
};
