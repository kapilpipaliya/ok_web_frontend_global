import { GenericField } from "~/components/fields/GenericField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { TableInputField } from "~/components/fields/table_input/TableInputField";

import { genericComponents2 } from "./genericComponents2";
import { genericInputComponents } from "./genericInputComponents";

export function getDynamicComponent(componentName: string) {
  switch (componentName) {
    case "SelectBox":
    case "TagBox":
      return SelectInputField;
    case "DynamicTable":
      return TableInputField;
    default:
      if (genericInputComponents.includes(componentName)) {
        return GenericInputField;
      }
      if (genericComponents2.includes(componentName)) {
        return GenericField;
      }
      return null;
  }
}
