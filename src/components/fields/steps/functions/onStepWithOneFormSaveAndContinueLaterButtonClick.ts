import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { getStepsContext } from "~/components/fields/steps/functions/getStepsContext";
import { getParentForm } from "~/components/form/functions/getParentForm";
import { validateFields } from "~/components/form/functions/validateFields";

import { getStepPercentage } from "./getStepPercentage";
import { onStepWithOneFormSaveButtonClick } from "./onStepWithOneFormSaveButtonClick";

export function onStepWithOneFormSaveAndContinueLaterButtonClick(
  options: FunctionArgumentType,
  fnOptions: { currentIndex: number; progressKey: string; totalSteps: number },
) {
  const [stepsContext] = getStepsContext();
  const parentForm = getParentForm(options.parentItems);
  if (parentForm) {
    const isValid = validateFields(
      options.formSchema,
      options.formValueStore,
      false,
      false,
    );
    onStepWithOneFormSaveButtonClick(options, { validateFields: false });
    const stepProgress = getStepPercentage(
      fnOptions.currentIndex,
      fnOptions.totalSteps,
      isValid,
      true,
    );
    if (
      !isValid ||
      options.formValueStore[fnOptions.progressKey] < stepProgress
    ) {
      parentForm[0].parentOnMerge({
        [fnOptions.progressKey]: stepProgress,
      });
    }
  }

  stepsContext.setCurrentStepIndex(0);
}
