import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { getStatus } from "~/components/fields/steps/functions/getStepStatusIconField";

export function firstNotStartedStepIndex(
  options: FunctionArgumentType,
  stepIndexToRequiredFieldsMap: string[][],
) {
  const totalSteps = stepIndexToRequiredFieldsMap.length;
  for (let i = 0; i < totalSteps; i++) {
    const requiredFields = stepIndexToRequiredFieldsMap[i] || [];
    const status = getStatus(options, requiredFields);
    if (status === "not-started" || status === "semi-completed") {
      return i;
    }
  }
  return totalSteps - 1;
}
