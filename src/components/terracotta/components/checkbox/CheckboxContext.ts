import { createContext, useContext } from "solid-js";

import assert from "../../utils/assert";

interface CheckboxContextData {
  descriptionID: string;
  indicatorID: string;
  labelID: string;
  ownerID: string;
}

export const CheckboxContext = createContext<CheckboxContextData>();

export function useCheckboxContext(componentName: string): CheckboxContextData {
  const context = useContext(CheckboxContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <Checkbox>`),
  );
  return context;
}
