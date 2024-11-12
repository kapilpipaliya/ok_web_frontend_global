import type { createStore } from "solid-js/store";

import { type Accessor, createContext, useContext } from "solid-js";

import { createKeyedContext } from "@corvu/utils/create/keyedContext";
import { Vertex } from "~/lib/graph/graph";

export interface StepsContextValue {
  canGoToNextStep: () => boolean;
  canGoToPreviousStep: () => boolean;
  currentNamedStep: Accessor<null | string>;
  currentStepIndex: Accessor<number | undefined>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isGoingToPreviousStep: Accessor<boolean>;
  meta: Vertex;
  data?: Vertex;
  setCurrentNamedStep(stepName: string): void;
  setCurrentStepIndex(index: number): void;
  steps: Accessor<Vertex[]>;
  stepsWithName: Accessor<Vertex[]>;
  validateCurrentStep: () => boolean;
}

type StepsStore = ReturnType<typeof createStore<StepsContextValue>>;

export const StepsContext = createContext<StepsStore>();

export function useStepsContext() {
  const context = useContext(StepsContext);

  if (context === undefined) {
    throw new Error(
      "`useStepsContext` must be used within a `Steps` component",
    );
  }

  return context;
}

createKeyedContext("steps", StepsContext);
