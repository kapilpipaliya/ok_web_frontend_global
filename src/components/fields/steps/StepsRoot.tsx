import { createSignal, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";


import { StepsContext, type StepsContextValue } from "./StepsContext";
import { usePageRenderContext } from "~/components/page_attr_render/PageRenderContext";
import { Vertex } from "~/lib/graph/graph";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";

interface StepsRootProps extends ParentProps<{}> {
  defaultStepIndex?: number;
}

export function StepsRoot(props: StepsRootProps) {
  const [parentContext] = usePageRenderContext();
  const meta = () => parentContext?.context.meta as Vertex;

  const [currentStepIndex, setCurrentStepIndex] = createSignal(
    props.defaultStepIndex ?? 0,
  );
  const [currentNamedStep, setCurrentNamedStep] = createSignal<null | string>(
    null,
  );
  const [isGoingToPreviousStep, setIsGoingToPreviousStep] = createSignal(false);

  const steps = () =>
    meta().children?.filter(
      (child) => child.componentName === "step" && !child.stepName,
    ) ?? [];
  const stepsWithName = () =>
    meta().children?.filter(
      (child) => child.componentName === "step" && child.stepName,
    ) ?? [];

  const validateCurrentStep = () => {
    const currentStep = steps()?.[currentStepIndex()] as Vertex;
    return currentStep?.P.validate?.() ?? true;
  };

  const canGoToNextStep = () => {
    return validateCurrentStep() && currentStepIndex() < steps().length - 1;
  };

  const canGoToPreviousStep = () => {
    return currentNamedStep() !== null || currentStepIndex() > 0;
  };

  const goToNextStep = () => {
    if (canGoToNextStep()) {
      setCurrentStepIndex(currentStepIndex() + 1);
    }
  };

  const goToPreviousStep = () => {
    if (canGoToPreviousStep()) {
      setIsGoingToPreviousStep(true);
      setTimeout(() => setIsGoingToPreviousStep(false), 600);
      if (currentNamedStep() !== null) {
        setCurrentNamedStep(null);
      } else {
        setCurrentStepIndex(currentStepIndex() - 1);
      }
    }
  };

  const stepsStore = createStore<StepsContextValue>({
    canGoToNextStep,
    canGoToPreviousStep,
    currentNamedStep,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    isGoingToPreviousStep,
    get meta() {
      return meta();
    },
    setCurrentNamedStep,
    setCurrentStepIndex,
    steps,
    stepsWithName,
    validateCurrentStep,
  });

  return (
    <StepsContext.Provider value={stepsStore}>
      {/* TODO Fix this */}
      <PageAttrRender data={props.data} metaVertex={props.meta} />
      {/* <RenderChildren
        meta={
          {
            // TODO FIx this
            children: meta()?.children?.filter(
              (child: Vertex) => child.P.componentName !== "step",
            ),
          } as GenericField
        }
      /> */}
    </StepsContext.Provider>
  );
}
