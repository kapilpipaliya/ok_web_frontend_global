import { createMemo, createSignal, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";

import { StepsContext, type StepsContextValue } from "./StepsContext";
import { usePageRenderContext } from "~/components/page_attr_render/context/PageRenderContext";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import type { GenericComponentProps } from "../FieldType";
import { getComponentLabel } from "~/components/page_designer/functions/getComponentLabel";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";

interface StepsRootProps extends Readonly<GenericComponentProps> {
  defaultStepIndex?: number;
}

export function StepsRoot(props: StepsRootProps) {
  const [graph, setGraph] = useGraph();
  const [parentContext] = usePageRenderContext();
  const meta = () => parentContext?.context.meta;
  const data = () => parentContext?.context.data;

  const [currentStepIndex, setCurrentStepIndex] = createSignal(
    props.defaultStepIndex ?? 0,
  );
  const [currentNamedStep, setCurrentNamedStep] = createSignal<null | string>(
    null,
  );
  const [isGoingToPreviousStep, setIsGoingToPreviousStep] = createSignal(false);

  const childrenAttrs = createMemo(() => getChildrenAttrs(graph, setGraph, meta()!));

  const steps = () =>
    childrenAttrs().filter(
      (child) => getComponentLabel(graph, child) === "Step" && !child.P.stepName,
    ) ?? [];
  const stepsWithName = () =>
    childrenAttrs().filter(
      (child) => getComponentLabel(graph, child) === "Step" && child.P.stepName,
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
      return meta()!;
    },
    get data() {
      return data();
    },
    setCurrentNamedStep,
    setCurrentStepIndex,
    steps,
    stepsWithName,
    validateCurrentStep,
  });

  return (
    <StepsContext.Provider value={stepsStore}>
      <PageAttrRender data={data()} metaVertex={meta()!} filter={(child) => {
        return getComponentLabel(graph, child) !== "Step";
      }}/>
    </StepsContext.Provider>
  );
}
