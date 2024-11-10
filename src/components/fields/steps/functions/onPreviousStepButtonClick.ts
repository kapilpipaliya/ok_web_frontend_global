import { useContext } from "solid-js";

import type { StepsContext } from "~/components/fields/steps/StepsContext";
import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { useKeyedContext } from "~/utils/keyedContext";

export function onPreviousStepButtonClick(_options: FunctionArgumentType) {
  const stepsContextProvider = useKeyedContext("steps") as typeof StepsContext;
  const stepsContext = useContext(stepsContextProvider);
  stepsContext?.[0].goToPreviousStep();
}
