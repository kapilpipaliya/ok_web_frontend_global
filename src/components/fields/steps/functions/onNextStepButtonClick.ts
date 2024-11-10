import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { validateFields } from "~/components/form/functions/validateFields";

import { getStepsContext } from "./getStepsContext";

export function onNextStepButtonClick(options: FunctionArgumentType) {
  const [stepsContext] = getStepsContext();

  const isValid = validateFields(
    stepsContext.steps()[stepsContext.currentStepIndex()],
    options.formValueStore,
  );

  if (isValid) {
    stepsContext.goToNextStep();
  }
}
