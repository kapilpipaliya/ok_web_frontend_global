import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { RenderStore } from "~/components/form/RenderContext";

import { getParentForm } from "~/components/form/functions/getParentForm";
import { validateFields } from "~/components/form/functions/validateFields";

export function onStepWithOneFormSaveButtonClick(
  options: FunctionArgumentType,
  fnOptions = {} as { validateFields: boolean },
) {
  if (fnOptions.validateFields ?? true) {
    const isValid = validateFields(
      options.formSchema,
      options.formValueStore,
      true,
    );
    if (!isValid) {
      return isValid;
    }
  }
  const parentItemsMeta = options.parentItems as RenderStore[];
  const parentForm = getParentForm(parentItemsMeta);
  if (!parentForm) {
    return true;
  }
  const parentItemsOnChange = parentForm[0].parentOnChange;
  const formValue = options.formValueStore;
  parentItemsOnChange(JSON.parse(JSON.stringify(formValue)));
  return true;
}
